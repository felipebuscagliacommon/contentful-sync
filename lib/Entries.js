const { asyncForEach, asyncMap } = require('./asyncIterators.js');

class Entries {
  constructor(environment, { updatedContent, newContent, removedContent }) {
    this.environment = environment;
    this.updatedEntries = updatedContent;
    this.newEntries = newContent;
    this.removedEntries = removedContent;
  }
  async upsertAndDelete() {
    const { updatedEntries, newEntries, removedEntries, environment } = this;

    let entriesToPublish = [];
    if (newEntries.length) {
      console.log('Creating new Entries...');
      console.log(JSON.stringify(newEntries));
      const entries = await this.createEntries(newEntries, environment);
      entriesToPublish = [...entriesToPublish, ...entries];
      console.log('Successfully created Entries');
    } else {
      console.log('No Entries to create');
    }

    if (updatedEntries.length) {
      console.log('Updating Entries...');
      console.log(JSON.stringify(updatedEntries));
      const entries = await this.updateEntries(updatedEntries, environment);
      entriesToPublish = [...entriesToPublish, ...entries];
      console.log('Successfully updated Entries');
    } else {
      console.log('No Entries to update');
    }

    if (removedEntries.length) {
      console.log('Removing Entries...');
      console.log(JSON.stringify(removedEntries));
      await this.removeEntries(removedEntries, environment);
      console.log('Successfully removed Entries');
    } else {
      console.log('No Entries to remove');
    }

    if (entriesToPublish.length) {
      console.log('Publishing entries:');
      console.log(JSON.stringify(entriesToPublish));
      await this.publishEntries(entriesToPublish, environment);
    } else {
      console.log('No Entries to publish');
    }
  }
  async updateEntries(entriesToUpdate, environment) {
    return await asyncMap(entriesToUpdate, async (entry) => {
      try {
        const foundEntry = await environment.getEntry(entry.sys.id);
        // merge found entry and existing entry and save
        delete entry.sys;
        const mergedEntry = Object.assign(foundEntry, entry);
        return await mergedEntry.update();
      } catch (e) {
        console.error('Error updating Entry. Entry was:');
        console.log(JSON.stringify(entry));
        throw e;
      }
    });
  }
  async createEntries(newEntries, environment) {
    return await asyncMap(newEntries, async (entry) => {
      try {
        return await environment.createEntryWithId(
          entry.sys.contentType.sys.id, // ID of ContentType
          entry.sys.id, // ID of Entry
          entry // Entry data
        );
      } catch (e) {
        console.error('Error creating Entry. Entry was:');
        console.log(JSON.stringify(entry));
        throw e;
      }
    });
  }
  async removeEntries(removedEntries, environment) {
    return await asyncForEach(removedEntries, async (entry) => {
      try {
        const foundEntry = await environment.getEntry(entry.sys.id);
        const unpublishedEntry = await foundEntry.unpublish();
        return await unpublishedEntry.delete();
      } catch (e) {
        console.error('Error removing Entry. Entry was:');
        console.log(JSON.stringify(entry));
        throw e;
      }
    });
  }
  async publishEntries(entriesToPublish, environment) {
    return await asyncForEach(entriesToPublish, async (entry) => {
      try {
        return await entry.publish();
      } catch (e) {
        console.error('Error publishing Entry. Entry was:');
        console.log(JSON.stringify(entry));
        throw e;
      }
    });
  }
}

module.exports = Entries;
