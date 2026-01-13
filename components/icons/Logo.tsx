import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 60"
    {...props}
  >
    <style>
        {`.logo-text-main { font-family: sans-serif; font-size: 24px; font-weight: 600; fill: #1e293b; letter-spacing: 0.5px; }`}
        {`.logo-text-sub { font-family: sans-serif; font-size: 18px; font-weight: 300; fill: #1e293b; letter-spacing: 0.25px; }`}
    </style>
    <text x="0" y="25" className="logo-text-main">
        Generational Wealth Analytics
    </text>
    <text x="0" y="50" className="logo-text-sub">
        Private Limited
    </text>
  </svg>
);

export default Logo;