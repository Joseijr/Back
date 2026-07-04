import { db } from './connection';
import { users, post, post_categories, notifications } from './schema';

const seed = async () => {
  const appStage = process.env.APP_STAGE;

  if (appStage === 'production') {
    console.error('ERROR: Cannot run seed script in production environment!');
    console.error('Current APP_STAGE:', appStage);
    process.exit(1);
  }

  console.log(`Running seed in ${appStage} environment...`);
  console.log('starting seed...');

  try {
    console.log('deleting existing data...');
    await db.delete(notifications).execute();
    await db.delete(post).execute();
    await db.delete(post_categories).execute();
    await db.delete(users).execute();

    console.log('inserting seed data...');

    const insertedUsers = await db.insert(users).values([
      {
        carnet: 'C07887',
        username: 'Hugo',
        password: 'password1',
        phone: '70123456',
      },
      {
        carnet: 'C34064',
        username: 'Jose',
        password: 'password2',
        phone: '71234567',
       
      },
    ]).returning();

    const insertedCategories = await db.insert(post_categories).values([
      { name: 'Electronicos' },
      { name: 'Juguetes' },
      { name: 'Libros' },
      { name: 'Ropa' },
      { name: 'Misc' },
    ]).returning();

    const insertedPosts = await db.insert(post).values([
      {
        title: 'Llave encontrada',
        description: 'Se encontró una llave negra cerca del salón principal.',
        category: insertedCategories[0].name,
        user_id: insertedUsers[0].id,
        authorUsername: insertedUsers[0].username,
        image: 'https://example.com/key.jpg',
        item_status: 'found',
      },
      {
        title: 'Cartera perdida',
        description: 'Se perdió una cartera con documentos y una libreta roja.',
        category: insertedCategories[3].name,
        user_id: insertedUsers[1].id,
        authorUsername: insertedUsers[1].username,
        image: 'https://example.com/wallet.jpg',
        item_status: 'lost',
      },
    ]).returning();

    await db.insert(notifications).values([
      {
        recipient_id: insertedUsers[0].id,
        actor_id: insertedUsers[1].id,
        post_id: insertedPosts[0].id,
        type: 'post_request',
        title: 'Solicitud de objeto',
        content: 'Jose indicó que desea contactar contigo por el objeto que publicaste.',
      },
      {
        recipient_id: insertedUsers[1].id,
        actor_id: insertedUsers[0].id,
        post_id: insertedPosts[1].id,
        type: 'post_request',
        title: 'Alguien respondió a tu publicación',
        content: 'Hugo quiere saber más sobre la publicación que compartiste.',
      },
    ]).execute();

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error running seed script:', error);
      process.exit(1);
    });
}

export default seed;