require('dotenv').config();

const upsertAssets = require('./upsertAssets.js');
const upsertEntries = require('./upsertEntries.js');
const upsertSchema = require('./upsertSchema.js');

module.exports = (setOfDifferences) => {
  console.log('Beginning upsert to Contentful...');
  const assets = setOfDifferences.find(set => set.type === 'Assets');
  return upsertAssets(assets.updatedContent, assets.newContent, assets.removedContent)
  .then( (res) => {
    const schema = setOfDifferences.find(set => set.type === 'Schema');
    return upsertSchema(schema.updatedContent, schema.newContent, schema.removedContent)
  })
  .then( (res) => {
    const entries = setOfDifferences.find(set => set.type === 'Entries');
    return upsertEntries(entries.updatedContent, entries.newContent, entries.removedContent);
  })
  .then( (res) => {
    console.log('Finished upsert!');
  })
  .catch( (err) => {
    console.error('Error');
    throw new Error(err);
  });
}