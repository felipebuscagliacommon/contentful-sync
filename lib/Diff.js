const moment = require('moment');

class Diff {
  constructor (contentfulData) {
    this.contentfulData = contentfulData;
    this.formatData();
    this.findDifferences();
  }
  formatData() {
    const { originData, targetData } = this.contentfulData;
    const targetContentTypes = targetData.contentTypes;
    const targetEntries = targetData.entries;
    const targetAssets = targetData.assets;

    const originContentTypes = originData.contentTypes;
    const originEntries = originData.entries;
    const originAssets = originData.assets;
    this.dataSets = [
      {
        type: 'Entries',
        originContent: originEntries,
        targetContent: targetEntries
      },
      {
        type: 'Assets',
        originContent: originAssets,
        targetContent: targetAssets
      },
      {
        type: 'ContentTypes',
        originContent: originContentTypes,
        targetContent: targetContentTypes
      }
    ]
  }
  findDifferences() {
    this.differences = this.dataSets.map(({originContent, targetContent, type}) => {
      const updatedContent = [];
      const newContent = [];
      const removedContent = [];
      // For each piece of origin's content, update the matching piece of target's content
      // if the publish of the origin's content is later than the matching target's content
      originContent.forEach( (originDatum) => {
        const matchingTargetDatum = targetContent.find( (targetDatum) => {
          return originDatum.sys.id === targetDatum.sys.id
        });
        if (matchingTargetDatum) {
          const targetPublishTime = moment(matchingTargetDatum.sys.publishedAt);
          const originPublishTime = moment(originDatum.sys.publishedAt);
          if (originPublishTime.isSameOrAfter(targetPublishTime)) {
            updatedContent.push(originDatum)
          }
        } else {
          newContent.push(originDatum)
        }
      });
      targetContent.forEach( (targetDatum) => {
        const matchingOriginDatum = originContent.find( (originDatum) => {
          return targetDatum.sys.id === originDatum.sys.id;
        });
        if (!matchingOriginDatum) {
          removedContent.push(targetDatum)
        }
      })
      return {
        type,
        updatedContent,
        newContent,
        removedContent
      }
    })
  }
}

module.exports = Diff;
