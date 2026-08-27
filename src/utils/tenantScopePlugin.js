const { mongoose } = require("mongoose");

// src/utils/tenantScopePlugin.js
function tenantScopePlugin(schema) {
    schema.add({ tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true } });

    // This regex covers find, findOne, findOneAndUpdate, updateOne, updateMany, etc.
    schema.pre(/^(find|update)/, function () {
        if (this.getQuery().tenantId === undefined && this.options.skipTenantScope !== true) {
            throw new Error('Tenant-scoped query/update missing tenantId.');
        }
    });

}

module.exports = { tenantScopePlugin };
