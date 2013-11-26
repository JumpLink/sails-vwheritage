/*---------------------------------------------------------------
  :: sails-boilerplate
  -> adapter
---------------------------------------------------------------*/

var async = require('async');
var request = require('request');
//var qs = require('querystring');

var adapter = module.exports = {

  // Set to true if this adapter supports (or requires) things like data types, validations, keys, etc.
  // If true, the schema for models using this adapter will be automatically synced when the server starts.
  // Not terribly relevant if not using a non-SQL / non-schema-ed data store
  syncable: false,

  // Including a commitLog config enables transactions in this adapter
  // Please note that these are not ACID-compliant transactions: 
  // They guarantee *ISOLATION*, and use a configurable persistent store, so they are *DURABLE* in the face of server crashes.
  // However there is no scheduled task that rebuild state from a mid-step commit log at server start, so they're not CONSISTENT yet.
  // and there is still lots of work to do as far as making them ATOMIC (they're not undoable right now)
  //
  // However, for the immediate future, they do a great job of preventing race conditions, and are
  // better than a naive solution.  They add the most value in findOrCreate() and createEach().
  // 
  // commitLog: {
  //  identity: '__default_mongo_transaction',
  //  adapter: 'sails-mongo'
  // },

  // Default configuration for collections
  // (same effect as if these properties were included at the top level of the model definitions)
  defaults: {

    // For example:
    // port: 3306,
    // host: 'localhost'

    // If setting syncable, you should consider the migrate option, 
    // which allows you to set how the sync will be performed.
    // It can be overridden globally in an app (config/adapters.js) and on a per-model basis.
    //
    // drop   => Drop schema and data, then recreate it
    // alter  => Drop/add columns as necessary, but try 
    // safe   => Don't change anything (good for production DBs)
    migrate: 'alter'
  },

  // This method runs when a model is initially registered at server start time
  registerCollection: function(collection, cb) {

    cb();
  },


  // The following methods are optional
  ////////////////////////////////////////////////////////////

  // Optional hook fired when a model is unregistered, typically at server halt
  // useful for tearing down remaining open connections, etc.
  teardown: function(cb) {
    cb();
  },


  // REQUIRED method if integrating with a schemaful database
  define: function(collectionName, definition, cb) {

    // Define a new "table" or "collection" schema in the data store
    cb();
  },
  // REQUIRED method if integrating with a schemaful database
  describe: function(collectionName, cb) {

    // Respond with the schema (attributes) for a collection or table in the data store
    var attributes = {};
    cb(null, attributes);
  },
  // REQUIRED method if integrating with a schemaful database
  drop: function(collectionName, cb) {
    // Drop a "table" or "collection" schema from the data store
    cb();
  },

  // Optional override of built-in alter logic
  // Can be simulated with describe(), define(), and drop(),
  // but will probably be made much more efficient by an override here
  // alter: function (collectionName, attributes, cb) { 
  // Modify the schema of a table or collection in the data store
  // cb(); 
  // },


  // REQUIRED method if users expect to call Model.create() or any methods
  create: function(collectionName, values, cb) {
    // Create a single new model specified by values

    // Respond with error or newly created model instance
    cb(null, values);
  },

  // REQUIRED method if users expect to call Model.find(), Model.findAll() or related methods
  // You're actually supporting find(), findAll(), and other methods here
  // but the core will take care of supporting all the different usages.
  // (e.g. if this is a find(), not a findAll(), it will only send back a single model)
  find: function(collectionName, options, cb) {

    // sails.log.error(options);
    // sails.log.error(options.where.id.split(','));

    // ** Filter by criteria in options to generate result set
    switch (collectionName) {
      case 'vwheritageproduct':
        get("product_info", options.where.id, function (err, res) {
          // Respond with an error or a *list* of models in result set
          cb(err, res);
        });
      break;
      case 'vwheritageimage':
        get("image_info", options.where.id, function (err, res) {
          // Respond with an error or a *list* of models in result set
          cb(err, res);
        });
      break;
      default:
        sails.log.error("Unknown Collection Name: "+collectionName);
    }
  },

  // REQUIRED method if users expect to call Model.update()
  update: function(collectionName, options, values, cb) {

    // ** Filter by criteria in options to generate result set

    // Then update all model(s) in the result set

    // Respond with error or a *list* of models that were updated
    cb();
  },

  // REQUIRED method if users expect to call Model.destroy()
  destroy: function(collectionName, options, cb) {

    // ** Filter by criteria in options to generate result set

    // Destroy all model(s) in the result set

    // Return an error or nothing at all
    cb();
  },



  // REQUIRED method if users expect to call Model.stream()
  stream: function(collectionName, options, stream) {
    // options is a standard criteria/options object (like in find)

    // stream.write() and stream.end() should be called.
    // for an example, check out:
    // https://github.com/balderdashy/sails-dirty/blob/master/DirtyAdapter.js#L247

  }



  /*
  **********************************************
  * Optional overrides
  **********************************************

  // Optional override of built-in batch create logic for increased efficiency
  // otherwise, uses create()
  createEach: function (collectionName, cb) { cb(); },

  // Optional override of built-in findOrCreate logic for increased efficiency
  // otherwise, uses find() and create()
  findOrCreate: function (collectionName, cb) { cb(); },

  // Optional override of built-in batch findOrCreate logic for increased efficiency
  // otherwise, uses findOrCreate()
  findOrCreateEach: function (collectionName, cb) { cb(); }
  */


  /*
  **********************************************
  * Custom methods
  **********************************************

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // > NOTE:  There are a few gotchas here you should be aware of.
  //
  //    + The collectionName argument is always prepended as the first argument.
  //      This is so you can know which model is requesting the adapter.
  //
  //    + All adapter functions are asynchronous, even the completely custom ones,
  //      and they must always include a callback as the final argument.
  //      The first argument of callbacks is always an error object.
  //      For some core methods, Sails.js will add support for .done()/promise usage.
  //
  //    + 
  //
  ////////////////////////////////////////////////////////////////////////////////////////////////////


  // Any other methods you include will be available on your models
  foo: function (collectionName, cb) {
    cb(null,"ok");
  },
  bar: function (collectionName, baz, watson, cb) {
    cb("Failure!");
  }


  // Example success usage:

  Model.foo(function (err, result) {
    if (err) console.error(err);
    else console.log(result);

    // outputs: ok
  })

  // Example error usage:

  Model.bar(235, {test: 'yes'}, function (err, result){
    if (err) console.error(err);
    else console.log(result);

    // outputs: Failure!
  })

  */


};

//////////////                 //////////////////////////////////////////
////////////// Private Methods //////////////////////////////////////////
//////////////                 //////////////////////////////////////////

var get = function (method, params, cb) {
  var method_url = "";
  var method_query = { sToken : sails.config.vwheritage.sToken };
  var api_url = sails.config.vwheritage.api_url;
  var number = params.split(',').length;
  var error = "";
  switch (method) {
    case 'product_info':
      method_url = sails.config.vwheritage.product_info_url;
      method_query[sails.config.vwheritage.product_info_query] = params;
    break;
    case 'product_list':
      method_url = sails.config.vwheritage.product_list_url;
    break;
    case 'image_info':
      method_url = sails.config.vwheritage.image_info_url;
      method_query[sails.config.vwheritage.image_info_query] = params;
    break;
    default:
      error = "Unknown method";
      sails.log.error(error);
      cb(error, null)
    break;
  }

  if (number > 1) {
    var request_url = api_url + method_url;
    var request_qs = method_query;
  } else {
    var request_url = api_url + method_url + "/" + params;
    var request_qs = {sToken : method_query.sToken};
  }

  console.log("request_url: "+request_url);

  var method = method;

  request({url: request_url, qs: request_qs, json: true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //sails.log.error("statusCode: "+response.statusCode);
      //sails.log.info(response);
      switch (method) {
        case 'product_info':
          var body = normalizeProduct (body);
        break;
        case 'product_list':

        break;
        case 'image_info':

        break;
      }
      if(!error && !(body instanceof Array))
        body = [body];
      //sails.log.info(body);
      cb(null, body);
    } else {
      sails.log.error(error);
      sails.log.error("statusCode: "+response.statusCode);
      //sails.log.info(response);
      cb({error: error, status: response.statusCode}, null);
    }
  });
}

/*
 * Zerteilt die description in einzele Attribute
 */
var normalizeDescription = function (data) {
  var description = {};
  data.originaldescription = data.DESCRIPTION;
  description.values = data.DESCRIPTION.toString().split('$');
  //description.names = new Array(description.values.length);

  switch (description.values.length) {
    // do not make a break in this switch case statement!
    case 5:
      var metrics = description.values[4].replace(/\'/g, "&#39;");
      if(metrics.length > 1) {
        data.metrics = metrics.split("\r\n");
        // ersten Eintrag loeschen, dieser hat keinen Inhalt.
        data.metrics.splice(0, 1);
      }
    case 4:
      data.fittinginfo = description.values[3].replace(/\r\n/g, "<br>");
    case 3:
      data.quality = description.values[2].replace(/\r\n/g, "");
    case 2:
      data.description = description.values[1].replace(/\r\n/g, "<br>");
    case 1:
      data.applications = description.values[0].split("\r\n");//.replace(/\r/g, "").replace(/\n/g, "");
      // letzten Eintrag loeschen, dieser hat keinen Inhalt.
      data.applications.splice(data.applications.length-1, data.applications.length-1);
      delete data.DESCRIPTION;
  }
  return data;
};
/*
 * Transformiert das Request-Ergebniss in ein besser behandelbares Format 
 */
var normalizeProduct = function (data) {
  data = normalizeDescription (data.DATA);
  data.sku = data.ITEMNUMBER[0];
  data.ITEMNAME = data.ITEMNAME[0];
  data.WEIGHT = data.WEIGHT[0];
  data.FREESTOCKQUANTITY = data.FREESTOCKQUANTITY[0];
  data.SPECIALORDER = data.SPECIALORDER[0];
  data.COSTPRICE = data.COSTPRICE[0];
  data.RETAILPRICE = data.RETAILPRICE[0];
  data.PRICE2 = data.PRICE2[0];
  data.PRICE3 = data.PRICE3[0];
  data.PRICE4 = data.PRICE4[0];
  data.DUEWEEKS = data.DUEWEEKS[0];
  data.AVAILABILITYMESSAGECODE = data.AVAILABILITYMESSAGECODE[0];
  return data;
};