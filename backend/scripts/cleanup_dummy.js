const mongoose = require('mongoose');
const uri = 'mongodb://artsy_admin:raushanbca998@ac-wkjiszj-shard-00-00.ohscg2m.mongodb.net:27017,ac-wkjiszj-shard-00-01.ohscg2m.mongodb.net:27017,ac-wkjiszj-shard-00-02.ohscg2m.mongodb.net:27017/artsy_with_love?ssl=true&authSource=admin&retryWrites=true';

async function cleanup() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to database...');
    
    const result = await mongoose.connection.collection('products').deleteMany({
      _id: { $in: [
        new mongoose.Types.ObjectId('69e10d6e868e421cf4e762da'), 
        new mongoose.Types.ObjectId('69e10e2d868e421cf4e762db')
      ] }
    });
    
    console.log('Cleanup successful:', result.deletedCount, 'items removed.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
