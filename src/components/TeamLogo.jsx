import React, { useState } from 'react';
import { Rocket } from 'lucide-react';

const TeamLogo = ({ url, name, className = "w-10 h-10 rounded-md", iconSize = "w-5 h-5" }) => {
    const [error, setError] = useState(false);
    if (!url || error) {
        return (
            <div className={`${className} bg-neutral-800 flex items-center justify-center border border-neutral-700 flex-shrink-0 shadow-sm`}>
                <Rocket className={`${iconSize} text-neutral-600`} />
            </div>
        );
    }
    return (
        <img src={url} alt={name} className={`${className} object-cover flex-shrink-0 bg-neutral-800`} onError={() => setError(true)} />
    );
};

export default TeamLogo;