const { Project, initDB } = require('./models');

const run = async () => {
    try {
        await initDB();
        const projects = await Project.findAll({ order: [['createdAt', 'ASC']] });

        console.log(`Found ${projects.length} projects to date.`);

        for (let i = 0; i < projects.length; i++) {
            const p = projects[i];
            if (p.customId) {
                console.log(`Skipping Project ${p.name} (has ID: ${p.customId})`);
                continue;
            }

            const count = i + 1;
            // Handle invalid createdAt
            const date = new Date(p.createdAt);
            const year = isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();

            const paddedId = String(count).padStart(5, '0');
            const customId = `P-${paddedId}-${year}`;

            await p.update({ customId });
            console.log(`Updated Project ${p.name} -> ${customId}`);
        }
    } catch (error) {
        console.error('Backfill failed:', error);
    }
    console.log('Backfill complete.');
    process.exit(0);
};

run();
