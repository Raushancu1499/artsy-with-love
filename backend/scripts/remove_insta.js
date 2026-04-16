const mongoose = require('mongoose');
const uri = 'mongodb://artsy_admin:raushanbca998@ac-wkjiszj-shard-00-00.ohscg2m.mongodb.net:27017,ac-wkjiszj-shard-00-01.ohscg2m.mongodb.net:27017,ac-wkjiszj-shard-00-02.ohscg2m.mongodb.net:27017/artsy_with_love?ssl=true&authSource=admin&retryWrites=true';

async function cleanup() {
  try {
    await mongoose.connect(uri);
    const result = await mongoose.connection.collection('products').deleteMany({
      images: { $regex: /insta/ }
    });
    console.log('Cleanup successful:', result.deletedCount, 'items removed.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}
cleanup();
