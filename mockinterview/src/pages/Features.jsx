import React from 'react';

const features = [
    {
        title: 'Feature One',
        description: 'Description for feature one.',
    },
    {
        title: 'Feature Two',
        description: 'Description for feature two.',
    },
    {
        title: 'Feature Three',
        description: 'Description for feature three.',
    },
];

const Features = () => {
    return (
        <div>
            <h1>Our Features</h1>
            <ul>
                {features.map((feature, index) => (
                    <li key={index}>
                        <h2>{feature.title}</h2>
                        <p>{feature.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Features;