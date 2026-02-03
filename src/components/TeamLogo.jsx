import React, { useEffect, useMemo, useState } from 'react';
import { Rocket } from 'lucide-react';

const TeamLogo = ({ url, name, className = "w-10 h-10 rounded-md", iconSize = "w-5 h-5", fit = "cover" }) => {
    const [error, setError] = useState(false);
    const [srcIndex, setSrcIndex] = useState(0);

    const srcOptions = useMemo(() => {
        if (!url) return [];
        const options = [];
        const isRenderUrl = url.includes('/storage/v1/render/image/');
        const webpFixUrl = isRenderUrl && url.includes('format=webp')
            ? url.replace('format=webp', 'format=jpeg')
            : null;
        const noFormatUrl = isRenderUrl
            ? url.replace(/([?&])format=[^&]+&?/g, '$1').replace(/[?&]$/, '')
            : null;
        const fallbackUrl = isRenderUrl
            ? url.replace('/storage/v1/render/image/', '/storage/v1/object/').split('?')[0]
            : null;

        if (fallbackUrl) options.push(fallbackUrl);
        options.push(url);
        if (webpFixUrl && webpFixUrl !== url) options.push(webpFixUrl);
        if (noFormatUrl && noFormatUrl !== url && noFormatUrl !== webpFixUrl) options.push(noFormatUrl);
        return options;
    }, [url]);

    useEffect(() => {
        if (srcOptions.length > 0) {
            console.log('[TeamLogo] URL options:', srcOptions);
        }
        setError(false);
        setSrcIndex(0);
    }, [srcOptions]);

    if (!url || error || srcOptions.length === 0) {
        return (
            <div className={`${className} bg-neutral-800 flex items-center justify-center border border-neutral-700 flex-shrink-0 shadow-sm`}>
                <Rocket className={`${iconSize} text-neutral-600`} />
            </div>
        );
    }
    return (
        <img
            src={srcOptions[srcIndex]}
            alt={name}
            className={`${className} ${fit === "contain" ? "object-contain" : "object-cover"} flex-shrink-0 bg-neutral-800`}
            onError={() => {
                const nextIndex = srcIndex + 1;
                if (nextIndex < srcOptions.length) {
                    console.warn('[TeamLogo] Failed to load, trying fallback:', srcOptions[nextIndex]);
                    setSrcIndex(nextIndex);
                } else {
                    console.warn('[TeamLogo] Failed to load all logo URLs.');
                    setError(true);
                }
            }}
        />
    );
};

export default TeamLogo;
