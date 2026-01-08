const { HeroDetailFetcher } = require('../services/heroDetailFetcher');

(async () => {
    const fetcher = new HeroDetailFetcher(console);
    console.log('Fetching Official Data for Daji (109)...');

    try {
        const data = await fetcher.fetchOfficialData(109);
        console.log('--- Official Data Result ---');
        console.log('Data Type:', typeof data);
        if (data) {
            console.log('Title:', data.title);
            console.log('Skills Array:', Array.isArray(data.skills));
            console.log('Skills Length:', data.skills ? data.skills.length : 'N/A');
            if (data.skills && data.skills.length > 0) {
                console.log('Skill[0] Icon:', data.skills[0].icon);
            } else {
                console.warn('WARNING: Skills array is empty!');
            }
        } else {
            console.error('ERROR: Result is NULL');
        }

    } catch (e) {
        console.error('Execution Error:', e);
    }
})();
