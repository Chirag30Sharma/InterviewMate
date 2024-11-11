from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import PyPDF2
import re
import random
from datetime import datetime
import json
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Google Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Enhanced generation configuration
generation_config = {
    "temperature": 0.9,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

TECHNICAL_INTERVIEW_PROMPT = """
You are an expert technical interviewer conducting a real-time technical interview.
Rules:
1. Ask dynamic technical questions based on the candidate's resume, job description, and stated experience level
2. Generate follow-up questions based on candidate's answers
3. Include cross-questions when answers need clarification or seem incomplete
4. Vary question difficulty based on candidate's performance and experience level
5. Focus on both theoretical knowledge and practical implementation
6. End the interview early if candidate shows exceptional expertise
7. Continue longer if answers need more exploration
8. Never repeat questions from previous sessions
9. Maintain context of the entire conversation
10. Ensure questions align with the job requirements and expected experience level
"""

NON_TECHNICAL_INTERVIEW_PROMPT = """
You are an expert HR interviewer conducting a comprehensive behavioral interview.
Rules:
1. Focus on situation-based questions and real-world scenarios aligned with job requirements
2. Probe deeper with follow-up questions based on responses
3. Cross-question when answers lack detail or consistency
4. Assess cultural fit and soft skills dynamically
5. Adapt question complexity based on candidate's responses and experience level
6. End interview early if candidate demonstrates strong alignment
7. Extend interview if areas need more exploration
8. Never repeat questions from previous sessions
9. Maintain conversation context throughout
10. Ensure questions match the responsibilities outlined in the job description
"""

# Global variable to store the interview state
INTERVIEW_STATE = {
    'resume_text': '',
    'job_role': '',
    'job_description': '',
    'domain': '',
    'question_pool': [],
    'previous_qa': [],
    'performance_scores': [],
    'interview_start_time': datetime.now().isoformat(),
    'experience_level': '',
    'cross_question_count': 0,
    'consecutive_good_answers': 0,
    'consecutive_poor_answers': 0
}

def parse_pdf(pdf_file):
    """Extract text from PDF file"""
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def clean_resume(text):
    """Clean and format resume text"""
    text = re.sub(r'[\u2022\u25CF\u25A0\u2023\u2043]+', '', text)
    text = re.sub(r'\s{2,}', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r'[^\w\s\.,;:\-\(\)\/]', '', text)
    return text.strip()

def should_generate_cross_question(answer_score, cross_question_count, answer):
    """Determine if a cross-question is needed"""
    if answer_score < 7 and cross_question_count < 2:
        return True
    if isinstance(answer, str) and any(phrase in answer.lower() for phrase in ["not sure", "maybe", "i think", "possibly"]):
        return True
    return False

# Update in the evaluate_final_interview function:

def evaluate_final_interview(previous_qa, performance_scores, start_time):
    """Provide comprehensive interview evaluation with detailed sections and metrics"""
    start_datetime = datetime.fromisoformat(start_time)
    avg_score = sum(performance_scores) / len(performance_scores) if performance_scores else 0
    interview_duration = (datetime.now() - start_datetime).total_seconds() / 60
    
    chat_session = model.start_chat(history=[])
    prompt = f"""
    Evaluate this technical interview comprehensively:
    
    Interview History:
    {json.dumps(previous_qa, indent=2)}
    
    Average Score: {avg_score:.1f}/10
    Interview Duration: {interview_duration:.1f} minutes
    Total Questions: {len(previous_qa)}
    
    Provide a structured evaluation following this exact format:

    1. Technical/Professional Competency Analysis
    - Strengths demonstrated during interview
    - Areas requiring improvement
    - Technical accuracy of responses
    - Problem-solving methodology
    
    2. Communication Skills Assessment
    - Clarity and articulation
    - Response structure and organization
    - Technical vocabulary usage
    - Confidence and presentation
    
    3. Problem-solving Approach
    - Analytical thinking demonstration
    - Solution methodology
    - Consideration of alternatives
    - Implementation understanding
    
    4. Areas of Excellence
    - Top performing knowledge areas
    - Notable responses that stood out
    - Strong technical concepts
    - Best demonstrated skills
    
    5. Areas for Improvement
    For each area needing development, provide:
    
    a) Online Learning Resources
    - Coursera courses with links
    - Udemy recommended courses 
    - edX programs
    - Other online platforms
    
    b) Technical Resources
    - Documentation links
    - GitHub repositories
    - Open source projects
    - Practice platforms
    
    c) Books & Reading Materials
    - Technical books with authors
    - Research papers
    - Industry articles
    - Blog recommendations
    
    d) Practice Projects
    - Hands-on project ideas
    - GitHub portfolio suggestions
    - System design exercises
    - Coding challenges
    
    6. Interview Performance Metrics
    - Response Quality: {avg_score:.1f}/10
    - Technical Accuracy: {min(avg_score + 1, 10):.1f}/10
    - Communication Score: {min(avg_score + 0.5, 10):.1f}/10
    - Problem-solving: {min(avg_score + 0.7, 10):.1f}/10
    - Overall Standing: {"Excellent" if avg_score >= 8.5 else "Good" if avg_score >= 7 else "Fair" if avg_score >= 5 else "Needs Improvement"}
    
    7. Development Timeline
    - Short-term goals (1-3 months)
    - Medium-term focus (3-6 months)
    - Long-term objectives (6-12 months)
    - Suggested learning path
    
    For all resources, include:
    - Direct links where applicable
    - Estimated time investment
    - Priority level (High/Medium/Low)
    - Specific benefits to address gaps
    """
    
    response = chat_session.send_message(prompt)
    evaluation_text = response.text.strip()
    
    # Clean and format the evaluation text
    evaluation_text = re.sub(r'[#*`]+', '', evaluation_text)
    evaluation_text = re.sub(r'\n\s*\n', '\n\n', evaluation_text)
    evaluation_text = re.sub(r'\s{2,}', ' ', evaluation_text)
    evaluation_text = re.sub(r'●|\u2022|\u25CF|\u25A0|\u2023|\u2043|■', '-', evaluation_text)
    evaluation_text = re.sub(r'[\u2018\u2019]', "'", evaluation_text)
    evaluation_text = re.sub(r'[\u201C\u201D]', '"', evaluation_text)
    
    # Extract metrics for the frontend
    metrics = {
        "response_quality": avg_score,
        "technical_accuracy": min(avg_score + 1, 10),
        "communication_score": min(avg_score + 0.5, 10),
        "problem_solving": min(avg_score + 0.7, 10)
    }
    
    return {
        "detailed_evaluation": evaluation_text,
        "average_score": avg_score,
        "total_questions": len(previous_qa),
        "interview_duration": interview_duration,
        "interview_date": start_datetime.strftime("%Y-%m-%d %H:%M:%S"),
        "metrics": metrics,
        "qa_pairs": previous_qa,
        "performance_category": "Excellent" if avg_score >= 8.5 else "Good" if avg_score >= 7 else "Fair" if avg_score >= 5 else "Needs Improvement"
    }
    
def generate_question_pool(resume_text, job_role, job_description, experience, domain):
    """Generate a pool of potential questions based on all available information"""
    system_prompt = TECHNICAL_INTERVIEW_PROMPT if domain == "Technical" else NON_TECHNICAL_INTERVIEW_PROMPT
    
    chat_session = model.start_chat(history=[])
    prompt = f"""
    {system_prompt}
    
    Resume: {resume_text}
    Job Role: {job_role}
    Job Description: {job_description}
    Experience Level: {experience}
    
    Generate 10 different interview questions suitable for this candidate, considering:
    1. The specific requirements mentioned in the job description
    2. The candidate's experience level ({experience})
    3. The alignment between the resume and job requirements
    
    Return only the questions, one per line.
    Focus on areas where the job description and resume overlap.
    Ensure question difficulty matches the stated experience level.
    """
    
    response = chat_session.send_message(prompt)
    questions = [q.strip() for q in response.text.strip().split('\n') if q.strip()]
    random.shuffle(questions)
    return questions

def assess_answer_quality(answer, context, experience_level):
    """Assess the quality of candidate's answer considering their experience level"""
    chat_session = model.start_chat(history=[])
    prompt = f"""
    Evaluate this interview answer for a candidate with {experience_level} experience:
    Context: {context}
    Answer: {answer}
    
    Consider:
    1. Technical accuracy/professional competency
    2. Depth of knowledge relative to stated experience
    3. Communication clarity
    4. Practical application understanding
    
    Rate on a scale of 1-10 and provide a brief reason. Return only the numeric score.
    """
    response = chat_session.send_message(prompt)
    try:
        score = float(response.text.strip())
        return min(max(score, 1), 10)
    except:
        return 5

def generate_question(experience_level, domain, is_cross_question=False):
    """Generate next interview question based on enhanced context"""
    if not is_cross_question and INTERVIEW_STATE['question_pool']:
        return INTERVIEW_STATE['question_pool'].pop()
    
    system_prompt = TECHNICAL_INTERVIEW_PROMPT if domain == "Technical" else NON_TECHNICAL_INTERVIEW_PROMPT
    
    focus_areas = [
        "technical skills",
        "problem-solving approach",
        "project experience",
        "system design",
        "coding practices",
        "team collaboration"
    ] if domain == "Technical" else [
        "leadership style",
        "conflict resolution",
        "project management",
        "team dynamics",
        "work ethics",
        "communication skills"
    ]
    
    random_focus = random.choice(focus_areas)
    qa_history = "\n".join([f"Q: {qa['question']}\nA: {qa['answer']}" for qa in INTERVIEW_STATE['previous_qa']])
    
    chat_session = model.start_chat(history=[])
    prompt = f"""
    {system_prompt}
    
    Resume: {INTERVIEW_STATE['resume_text']}
    Job Role: {INTERVIEW_STATE['job_role']}
    Job Description: {INTERVIEW_STATE['job_description']}
    Experience Level: {experience_level}
    Previous Exchange: {qa_history}
    Focus Area: {random_focus}
    
    Generate a {'cross-question based on the last answer' if is_cross_question else f'new question focusing on {random_focus}'}.
    Consider:
    1. Alignment with job description requirements
    2. Appropriate difficulty for {experience_level} experience level
    3. Previous questions: {', '.join(qa['question'] for qa in INTERVIEW_STATE['previous_qa'])}
    
    Return only the question, no explanations.
    """
    
    response = chat_session.send_message(prompt)
    return response.text.strip()

@app.route('/reset_interview', methods=['POST'])
def reset_interview():
    try:
        global INTERVIEW_STATE
        INTERVIEW_STATE = {
            'resume_text': '',
            'job_role': '',
            'job_description': '',
            'domain': '',
            'question_pool': [],
            'previous_qa': [],
            'performance_scores': [],
            'interview_start_time': datetime.now().isoformat(),
            'experience_level': '',
            'cross_question_count': 0,
            'consecutive_good_answers': 0,
            'consecutive_poor_answers': 0
        }
        
        return jsonify({
            'message': 'Interview state reset successfully',
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/start_interview', methods=['POST'])
def start_interview():
    try:
        # Reset the interview state first
        reset_interview()
        
        pdf_file = request.files['resume']
        INTERVIEW_STATE['job_role'] = request.form['job_role']
        INTERVIEW_STATE['job_description'] = request.form['job_description']
        INTERVIEW_STATE['experience_level'] = request.form['experience']
        INTERVIEW_STATE['domain'] = request.form['domain'].strip()

        if INTERVIEW_STATE['domain'] not in ['Technical', 'Non Technical']:
            return jsonify({'error': 'Invalid domain'}), 400

        INTERVIEW_STATE['resume_text'] = parse_pdf(pdf_file)
        INTERVIEW_STATE['resume_text'] = clean_resume(INTERVIEW_STATE['resume_text'])
        
        INTERVIEW_STATE['question_pool'] = generate_question_pool(
            INTERVIEW_STATE['resume_text'],
            INTERVIEW_STATE['job_role'],
            INTERVIEW_STATE['job_description'],
            INTERVIEW_STATE['experience_level'],
            INTERVIEW_STATE['domain']
        )
        
        first_question = generate_question(
            INTERVIEW_STATE['experience_level'],
            INTERVIEW_STATE['domain']
        )

        return jsonify({
            'question': first_question,
            'question_number': 1,
            'interview_start_time': INTERVIEW_STATE['interview_start_time']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/continue_interview', methods=['POST'])
def continue_interview():
    try:
        data = request.json
        current_answer = data.get('answer', '')

        # Assess answer quality considering experience level
        answer_score = assess_answer_quality(
            current_answer, 
            data['question'],
            INTERVIEW_STATE['experience_level']
        )
        INTERVIEW_STATE['performance_scores'] = INTERVIEW_STATE.get('performance_scores', []) + [answer_score]

        # Update consecutive answer counters
        good_threshold = random.uniform(7.5, 8.5)
        poor_threshold = random.uniform(3.5, 4.5)

        if answer_score >= good_threshold:
            INTERVIEW_STATE['consecutive_good_answers'] += 1
            INTERVIEW_STATE['consecutive_poor_answers'] = 0
        elif answer_score <= poor_threshold:
            INTERVIEW_STATE['consecutive_poor_answers'] += 1
            INTERVIEW_STATE['consecutive_good_answers'] = 0

        INTERVIEW_STATE['previous_qa'].append({'question': data['question'], 'answer': current_answer})

        # Determine if interview should end
        min_questions = random.randint(3, 4)
        max_questions = random.randint(7, 9)
        should_end = (
            (len(INTERVIEW_STATE['previous_qa']) >= min_questions and INTERVIEW_STATE['consecutive_good_answers'] >= 2) or
            len(INTERVIEW_STATE['previous_qa']) >= max_questions or
            INTERVIEW_STATE['consecutive_poor_answers'] >= 3
        )

        if should_end:
            evaluation = evaluate_final_interview(
                INTERVIEW_STATE['previous_qa'],
                INTERVIEW_STATE['performance_scores'],
                INTERVIEW_STATE['interview_start_time']
            )
            return jsonify({
                'message': 'Interview completed',
                'evaluation': evaluation
            })

        # Generate next question
        if should_generate_cross_question(answer_score, INTERVIEW_STATE['cross_question_count'], current_answer):
            next_question = generate_question(
                INTERVIEW_STATE['experience_level'],
                INTERVIEW_STATE['domain'],
                is_cross_question=True
            )
            INTERVIEW_STATE['cross_question_count'] += 1
        else:
            next_question = generate_question(
                INTERVIEW_STATE['experience_level'],
                INTERVIEW_STATE['domain']
            )

        current_duration = (datetime.now() - datetime.fromisoformat(INTERVIEW_STATE['interview_start_time'])).total_seconds() / 60

        return jsonify({
            'question': next_question,
            'question_number': len(INTERVIEW_STATE['previous_qa']) + 1,
            'current_duration': f"{current_duration:.1f} minutes"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)