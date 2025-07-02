
'use server';

import mysql from 'mysql2/promise';
import { db, FullBackupData } from '@/lib/data';

interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export async function testDbConnection(config: DbConfig) {
  try {
    const connection = await mysql.createConnection(config);
    await connection.ping();
    await connection.end();
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Connection Error:', error);
    // Sanitize error message to avoid exposing sensitive info
    let errorMessage = 'An unknown error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'ECONNREFUSED':
                errorMessage = 'Connection refused. Check if the database server is running and the host/port are correct.';
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                errorMessage = 'Access denied. Check your username and password.';
                break;
            case 'ER_BAD_DB_ERROR':
                errorMessage = 'Database not found. Check the database name.';
                break;
            default:
                errorMessage = `Error: ${error.code}. Please check your connection details.`;
        }
    }
    return { success: false, error: errorMessage };
  }
}

const CREATE_TABLE_SQL = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(255),
    profileComplete BOOLEAN DEFAULT FALSE,
    portfolioSlug VARCHAR(255) UNIQUE,
    profilePictureUrl TEXT,
    bio TEXT,
    website TEXT,
    instagram TEXT,
    twitter TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    clientName VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    location VARCHAR(255),
    photographer VARCHAR(255),
    status ENUM('Pendente', 'Em Andamento', 'Concluído') NOT NULL,
    stage ENUM('Sessão Fotográfica', 'Edição', 'Entrega') NOT NULL,
    income DECIMAL(10, 2) DEFAULT 0.00,
    expenses DECIMAL(10, 2) DEFAULT 0.00,
    paymentStatus ENUM('Pago', 'Não Pago', 'Parcialmente Pago') NOT NULL,
    description TEXT,
    imageUrl VARCHAR(1024),
    user_email VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS gallery_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    imageUrl TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );`
];


export async function createDatabaseTables(config: DbConfig) {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    for (const sql of CREATE_TABLE_SQL) {
      await connection.query(sql);
    }
    await connection.end();
    return { success: true, message: 'Tabelas do banco de dados criadas com sucesso!' };
  } catch (error: any) {
    console.error('MySQL Table Creation Error:', error);
    if (connection) await connection.end();
    return { success: false, error: `Falha ao criar tabelas: ${error.message}` };
  }
}

export async function exportAllDataAsJson(): Promise<string> {
    const data = db.getFullBackup();
    return JSON.stringify(data, null, 2);
}

export async function importJsonToMysql(config: DbConfig, jsonData: string) {
    let connection;
    try {
        const data: FullBackupData = JSON.parse(jsonData);
        
        connection = await mysql.createConnection(config);
        await connection.beginTransaction();

        // Import users
        for (const user of data.users) {
            if (!user.password || !user.email) continue;
            await connection.execute(
                `INSERT INTO users (email, password, name, company, phone, profileComplete, portfolioSlug, profilePictureUrl, bio, website, instagram, twitter) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                    password=VALUES(password), name=VALUES(name), company=VALUES(company), phone=VALUES(phone), profileComplete=VALUES(profileComplete), portfolioSlug=VALUES(portfolioSlug), profilePictureUrl=VALUES(profilePictureUrl), bio=VALUES(bio), website=VALUES(website), instagram=VALUES(instagram), twitter=VALUES(twitter)
                `,
                [
                    user.email, user.password, user.name || null, user.company || null, user.phone || null, user.profileComplete || false,
                    user.portfolioSlug || null, user.profilePictureUrl || null, user.bio || null, user.website || null,
                    user.instagram || null, user.twitter || null
                ]
            );
        }

        // Import projects and gallery images
        const allProjects = Object.values(data.projects).flat();
        for (const project of allProjects) {
            if (!project.user_email) continue;
            
            await connection.execute(
                `INSERT INTO projects (id, clientName, date, location, photographer, status, stage, income, expenses, paymentStatus, description, imageUrl, user_email) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    clientName=VALUES(clientName), date=VALUES(date), location=VALUES(location), photographer=VALUES(photographer), status=VALUES(status), stage=VALUES(stage), income=VALUES(income), expenses=VALUES(expenses), paymentStatus=VALUES(paymentStatus), description=VALUES(description), imageUrl=VALUES(imageUrl)
                `,
                [
                    project.id, project.clientName, new Date(project.date), project.location, project.photographer,
                    project.status, project.stage, project.income, project.expenses, project.paymentStatus,
                    project.description, project.imageUrl || null, project.user_email
                ]
            );

            if (project.galleryImages && project.galleryImages.length > 0) {
                await connection.execute('DELETE FROM gallery_images WHERE project_id = ?', [project.id]);
                for (const imageUrl of project.galleryImages) {
                    await connection.execute(
                        'INSERT INTO gallery_images (project_id, imageUrl) VALUES (?, ?)',
                        [project.id, imageUrl]
                    );
                }
            }
        }
        
        await connection.commit();
        await connection.end();

        const projectCount = allProjects.length;
        return { success: true, message: `Dados importados! ${data.users.length} usuários e ${projectCount} projetos.` };

    } catch (error: any) {
        if (connection) {
            await connection.rollback();
            await connection.end();
        }
        console.error('MySQL Import Error:', error);
        if (error instanceof SyntaxError) {
             return { success: false, error: 'Erro de sintaxe no JSON. Verifique se o formato está correto.' };
        }
        return { success: false, error: `Falha ao importar dados: ${error.message}` };
    }
}
