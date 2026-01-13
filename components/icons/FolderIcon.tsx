import React from 'react';

const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 013.75 3h5.218c.454 0 .895.18 1.232.518l.94 1.054A.75.75 0 0011.83 5.25h2.922a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25m-16.5 0h16.5M3.75 16.5h16.5" />
    </svg>
);

export default FolderIcon;