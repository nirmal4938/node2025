// Utility function for template replacement
const compileTemplate = (template, replacements) => {
    return template.replace(/{{([\w.]+)}}/g, (_, key) => {
        // Resolve nested keys, e.g., "metadata.location"
        const keys = key.split('.');
        let value = replacements;
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break; // Stop if a key doesn't exist
        }
        return value !== undefined ? value : ''; // Return value or empty string
    });
};

module.exports = { compileTemplate };
