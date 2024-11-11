import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404 - Page Not Found</h1>
            <p className="not-found-message">Sorry, the page you are looking for does not exist.</p>
            <button className="home-button" onClick={goToHome}>Press here to go to Home</button>
            <style jsx>{`
                .not-found-container {
                    text-align: center;
                    padding: 50px;
                }
                .not-found-title {
                    font-size: 2em;
                    margin-bottom: 20px;
                }
                .not-found-message {
                    margin-bottom: 20px;
                }
                .home-button {
                    padding: 10px 20px;
                    font-size: 1em;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default NotFound;