import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatEvaluationSection = (content) => {
  if (!content) return [];

  const sections = content.split(/(?=\d+\.\s)/);
  return sections.map((section) => {
    const [title, ...contentLines] = section.split('\n');
    const sectionContent = contentLines
      .join('\n')
      .split(/(?=[a-z]\))/g)
      .map((part) => {
        if (part.trim().match(/^[a-z]\)/)) {
          const [subTitle, ...subContent] = part.split('\n');
          return {
            type: 'subsection',
            title: subTitle.trim(),
            content: subContent
              .filter((line) => line.trim())
              .map((line) => line.trim().replace(/^[-•]/, '')),
          };
        }
        return {
          type: 'text',
          content: part.trim(),
        };
      });

    return {
      title: title.trim(),
      content: sectionContent,
    };
  });
};

const extractMetricsFromDetailedEvaluation = (detailedEvaluation) => {
  try {
    const responseQualityMatch = detailedEvaluation.match(/Response Quality: (\d+\.?\d*)/);
    const technicalAccuracyMatch = detailedEvaluation.match(/Technical Accuracy: (\d+\.?\d*)/);
    const communicationMatch = detailedEvaluation.match(/Communication Score: (\d+\.?\d*)/);
    const problemSolvingMatch = detailedEvaluation.match(/Problem-solving: (\d+\.?\d*)/);

    return {
      response_quality: responseQualityMatch ? parseFloat(responseQualityMatch[1]) : 0,
      technical_accuracy: technicalAccuracyMatch ? parseFloat(technicalAccuracyMatch[1]) : 0,
      communication_score: communicationMatch ? parseFloat(communicationMatch[1]) : 0,
      problem_solving: problemSolvingMatch ? parseFloat(problemSolvingMatch[1]) : 0
    };
  } catch (error) {
    console.error('Error extracting metrics:', error);
    return {
      response_quality: 0,
      technical_accuracy: 0,
      communication_score: 0,
      problem_solving: 0
    };
  }
};

const getUniqueQuestions = (qa_pairs) => {
  const seen = new Set();
  return qa_pairs.filter(qa => {
    if (seen.has(qa.question)) {
      return false;
    }
    seen.add(qa.question);
    return true;
  });
};

const generateRadarChart = (doc, metrics, x, y, size) => {
  const centerX = x + size/2;
  const centerY = y + size/2;
  const radius = size/2;
  const points = 4;
  const angle = (2 * Math.PI) / points;
  
  // Draw background circles
  for (let i = 1; i <= 5; i++) {
    doc.setDrawColor(200, 200, 200);
    doc.circle(centerX, centerY, (radius * i) / 5);
  }

  // Draw radar lines
  for (let i = 0; i < points; i++) {
    const x1 = centerX + radius * Math.cos(i * angle);
    const y1 = centerY + radius * Math.sin(i * angle);
    doc.line(centerX, centerY, x1, y1);
  }

  // Add metric labels
  doc.setFontSize(8);
  doc.text('Response Quality', centerX, centerY - radius - 5);
  doc.text('Technical Accuracy', centerX + radius + 5, centerY);
  doc.text('Communication', centerX, centerY + radius + 10);
  doc.text('Problem Solving', centerX - radius - 25, centerY);

  // Plot metrics
  const values = [
    metrics.response_quality,
    metrics.technical_accuracy,
    metrics.communication_score,
    metrics.problem_solving
  ];

  const points_x = [];
  const points_y = [];
  
  values.forEach((value, i) => {
    const distance = (value / 10) * radius;
    points_x.push(centerX + distance * Math.cos(i * angle));
    points_y.push(centerY + distance * Math.sin(i * angle));
  });

  // Draw filled polygon
  doc.setFillColor(70, 130, 180);
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(0.5);

  // Draw the polygon lines
  for (let i = 0; i < points_x.length; i++) {
    if (i === 0) {
      doc.moveTo(points_x[i], points_y[i]);
    } else {
      doc.line(points_x[i-1], points_y[i-1], points_x[i], points_y[i]);
    }
  }
  // Close the polygon
  doc.line(points_x[points_x.length-1], points_y[points_y.length-1], points_x[0], points_y[0]);

  // Add points
  values.forEach((value, i) => {
    const distance = (value / 10) * radius;
    const x = centerX + distance * Math.cos(i * angle);
    const y = centerY + distance * Math.sin(i * angle);
    doc.setFillColor(70, 130, 180);
    doc.circle(x, y, 1.5, 'F');
  });
};

const addPageHeader = (doc, text) => {
  const pageWidth = doc.internal.pageSize.width;
  doc.setFillColor(70, 130, 180);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.text(text, 20, 25);
  doc.setTextColor(0);
};

const getRating = (score) => {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Average';
  if (score >= 3) return 'Fair';
  return 'Needs Improvement';
};

const renderFormattedSection = (doc, section, startY, marginX, pageWidth, pageHeight) => {
  let currentY = startY;
  const lineHeight = 7; // Consistent line height
  const marginBottom = 20;
  const contentWidth = pageWidth - (marginX * 2);

  // Section Title
  doc.setFontSize(12); // Consistent title font size
  doc.setFont(undefined, 'bold');
  const titleLines = doc.splitTextToSize(section.title, contentWidth);
  titleLines.forEach(line => {
    if (currentY + lineHeight > pageHeight - marginBottom) {
      doc.addPage();
      addPageHeader(doc, 'Detailed Evaluation (Continued)');
      currentY = 60;
      doc.setFontSize(12); // Maintain font size after page break
      doc.setFont(undefined, 'bold');
    }
    doc.text(line, marginX, currentY);
    currentY += lineHeight;
  });
  currentY += lineHeight / 2;

  // Section Content
  doc.setFontSize(10); // Consistent content font size
  section.content.forEach(item => {
    if (item.type === 'subsection') {
      // Subsection Title
      if (currentY + lineHeight > pageHeight - marginBottom) {
        doc.addPage();
        addPageHeader(doc, 'Detailed Evaluation (Continued)');
        currentY = 60;
        doc.setFontSize(10); // Maintain font size after page break
      }

      doc.setFont(undefined, 'bold');
      const subTitleLines = doc.splitTextToSize(item.title, contentWidth - 10);
      subTitleLines.forEach(line => {
        doc.text(line, marginX + 5, currentY);
        currentY += lineHeight;
      });

      // Subsection Content
      doc.setFont(undefined, 'normal');
      item.content.forEach(line => {
        const contentLines = doc.splitTextToSize(line, contentWidth - 15);
        contentLines.forEach(contentLine => {
          if (currentY + lineHeight > pageHeight - marginBottom) {
            doc.addPage();
            addPageHeader(doc, 'Detailed Evaluation (Continued)');
            currentY = 60;
            doc.setFontSize(10); // Maintain font size after page break
            doc.setFont(undefined, 'normal');
          }
          doc.text(contentLine, marginX + 10, currentY);
          currentY += lineHeight;
        });
      });
    } else {
      // Regular Content
      const contentLines = doc.splitTextToSize(item.content, contentWidth);
      contentLines.forEach(line => {
        if (currentY + lineHeight > pageHeight - marginBottom) {
          doc.addPage();
          addPageHeader(doc, 'Detailed Evaluation (Continued)');
          currentY = 60;
          doc.setFontSize(10); // Maintain font size after page break
          doc.setFont(undefined, 'normal');
        }
        doc.text(line, marginX, currentY);
        currentY += lineHeight;
      });
    }
    currentY += lineHeight / 2;
  });

  return currentY;
};

export const generatePDF = (evaluation) => {
  const doc = new jsPDF();
  const metrics = extractMetricsFromDetailedEvaluation(evaluation.detailed_evaluation);
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Cover Page
  doc.setFillColor(70, 130, 180);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Add a decorative element
  doc.setFillColor(255, 255, 255, 0.1);
  doc.circle(pageWidth/2, pageHeight/2, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(30);
  doc.setFont(undefined, 'bold');
  doc.text('Interview', pageWidth/2, pageHeight/3, { align: 'center' });
  doc.text('Evaluation', pageWidth/2, pageHeight/3 + 20, { align: 'center' });
  doc.text('Report', pageWidth/2, pageHeight/3 + 40, { align: 'center' });
  
  // Add overall score as a big number
  doc.setFontSize(50);
  const overallScore = evaluation?.average_score?.toFixed(1) || 'N/A';
  doc.text(overallScore, pageWidth/2, pageHeight/2 + 40, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Overall Score', pageWidth/2, pageHeight/2 + 55, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth/2, pageHeight - 30, { align: 'center' });

  // Metrics Page
  doc.addPage();
  addPageHeader(doc, 'Performance Overview');

  // Add radar chart
  generateRadarChart(doc, metrics, 50, 50, 100);

  // Metrics table with gradient backgrounds
  doc.autoTable({
    startY: 170,
    head: [['Metric', 'Score', 'Rating']],
    body: [
      ['Response Quality', metrics.response_quality.toFixed(1), getRating(metrics.response_quality)],
      ['Technical Accuracy', metrics.technical_accuracy.toFixed(1), getRating(metrics.technical_accuracy)],
      ['Communication Score', metrics.communication_score.toFixed(1), getRating(metrics.communication_score)],
      ['Problem Solving', metrics.problem_solving.toFixed(1), getRating(metrics.problem_solving)]
    ],
    styles: { 
      halign: 'center',
      fillColor: [240, 240, 240],
      textColor: [50, 50, 50],
      fontSize: 12
    },
    headStyles: { 
      fillColor: [70, 130, 180],
      textColor: [255, 255, 255],
      fontSize: 14,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  });

  // Q&A Pages
  const uniqueQAPairs = getUniqueQuestions(evaluation.qa_pairs || []);

  uniqueQAPairs.forEach((qa, index) => {
    doc.addPage();
    addPageHeader(doc, `Question ${index + 1}`);

    // Question content with background
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 50, pageWidth - 40, 40, 'F');
    doc.setFontSize(12);
    const questionLines = doc.splitTextToSize(qa.question || 'N/A', pageWidth - 60);
    doc.text(questionLines, 30, 65);

    // Answer section
    doc.setFontSize(14);
    doc.setTextColor(70, 130, 180);
    doc.text('Answer:', 20, 110);
    doc.setTextColor(0);
    doc.setFontSize(12);
    const answerLines = doc.splitTextToSize(qa.answer || 'N/A', pageWidth - 60);
    doc.text(answerLines, 20, 125);

    // Add decorative element
    doc.setDrawColor(70, 130, 180);
    doc.setLineWidth(0.5);
    doc.line(20, 100, pageWidth - 20, 100);
  });

  // Detailed Evaluation Page
  doc.addPage();
  addPageHeader(doc, 'Detailed Evaluation');

  const formattedSections = formatEvaluationSection(evaluation.detailed_evaluation);
  let currentY = 60;
  const marginX = 20;

  // Track the last used page
  let lastUsedPage = doc.internal.getNumberOfPages();

  formattedSections.forEach(section => {
    currentY = renderFormattedSection(doc, section, currentY, marginX, pageWidth, pageHeight);
    lastUsedPage = doc.internal.getNumberOfPages();
  });

  // Remove any extra blank pages
  while (doc.internal.getNumberOfPages() > lastUsedPage) {
    doc.deletePage(doc.internal.getNumberOfPages());
  }

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save('Interview_Evaluation_Report.pdf');
};
