
import { db } from './src/db/db';

async function verifyDatabase() {
    try {
        console.log('Verifying database...');
        await db.open();
        console.log('Database opened successfully');

        // Check tables
        const tables = db.tables.map(t => t.name);
        console.log('Tables:', tables);

        // Add a test project
        const projectId = await db.projects.add({
            name: 'Test Project',
            status: 'Active',
            client: 'Test Client',
            createdAt: new Date()
        });
        console.log('Added project with ID:', projectId);

        const project = await db.projects.get(projectId);
        console.log('Retrieved project:', project);

        // Clean up
        await db.projects.delete(projectId);
        console.log('Cleaned up test project');

    } catch (error) {
        console.error('Database verification failed:', error);
    }
}

// verifyDatabase(); // Uncomment to run manually if needed in browser
