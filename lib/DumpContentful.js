const contentfulExport = require('contentful-export');

class DumpContentful {
  constructor(config) {
    this.config = config;
    this.setOriginSpaceOpts();
    this.setTargetSpaceOpts();
  }
  setOriginSpaceOpts () {
    const { originSpaceId, originEnvironmentId = 'master', managementToken } = this.config;
    this.originSpaceOpts = {
      spaceId: originSpaceId,
      managementToken,
      maxAllowedItems: 10000,
      skipRoles: true,
      saveFile: false,
      environmentId: originEnvironmentId
    };
  }
  setTargetSpaceOpts () {
    const { targetSpaceId, targetEnvironmentId = 'master' , managementToken } = this.config;
    this.targetSpaceOpts = {
      spaceId: targetSpaceId,
      managementToken,
      maxAllowedItems: 10000,
      skipRoles: true,
      saveFile: false,
      environmentId: targetEnvironmentId
    };
  }
  dump () {
    console.log('Beginning dump of Contentful...');
    const data = {};
    return contentfulExport(this.originSpaceOpts)
    .then(originData => {
      data.originData = originData;
      return contentfulExport(this.targetSpaceOpts);
    })
    .then(targetData => {
      data.targetData = targetData;
      return data;
    })
    .catch(err => {
      console.error('Error dumping Contentful');
      console.error(err);
    });
  }
}

module.exports = DumpContentful;