/*---------------------------------------------------------------
  :: sails-boilerplate
  -> adapter
---------------------------------------------------------------*/

var async = require('async');
var request = require('request');
var qs = require('querystring');

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
      case 'vwhproduct':
        if (typeof(options.where) === 'undefined' || options.where === null)
          get("product_list", null, function (err, res) {
            cb(err, res);
          });
        else if (typeof(options.where.id) !== 'undefined')
          get("product_info", options.where.id, function (err, res) {
            // Respond with an error or a *list* of models in result set
            cb(err, res);
          });
        else {
          sails.log.error("Missing ID");
          cb("Missing ID", null);
        }

      break;
      case 'vwhimage':
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

  },



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
    else sails.log.debug(result);

    // outputs: ok
  })

  // Example error usage:

  Model.bar(235, {test: 'yes'}, function (err, result){
    if (err) console.error(err);
    else sails.log.debug(result);

    // outputs: Failure!
  })

  */

  infos: function (collectionName, final_callback) {

    var transform_1d_array_to_2d_array_of_max = function(one_d_array) {
      var MAX = 80;
      var tow_d_array = [];
      tow_d_array.length = Math.round( (one_d_array.length / MAX) + 0.5 ); // Round up
      var last_array_length = one_d_array.length - ( Math.round( (one_d_array.length / MAX) - 0.5 ) /*Round down*/ * MAX );
      for (var i = 0; i < tow_d_array.length; i++) {
        var tmp_array = [];
        for (var a = 0; a < MAX && one_d_array.length > i*MAX+a; a++) {
          tmp_array.push(one_d_array[i*MAX+a]);
        }
        tow_d_array[i] = tmp_array;
      }
      if (tow_d_array[tow_d_array.length-1].length === last_array_length)
        sails.log.debug("OK");
      else
        sails.log.debug("ERROR");
      return tow_d_array;
    };

    var get_product_list = function (callback){
      get("product_list", null, callback);
    };

    var get_sku_from_product = function (product, callback) {
      callback(null, product.sku);
    };

    var get_id_from_product = function (product, callback) {
      callback(null, product.id);
    };

    var extract_skus_from_product_list = function (product_list, callback) {
      async.map(
          product_list
        , get_sku_from_product
        , callback
      );
    };

    var extract_ids_from_product_list = function (product_list, callback) {
      async.map(
          product_list
        , get_id_from_product
        , callback
      );
    };


    var iterate_sku_block = function (one_d_array, callback) {
      get("product_info", one_d_array, callback);
    }

    var iterate_id_block = function (one_d_array, callback) {
      get("product_info_id", one_d_array, callback);
    }

    var get_product_info_sku_for_each = function (sku, callback){
      //sails.log.debug(sku);
      var tow_d_array = transform_1d_array_to_2d_array_of_max(sku);
      async.map(
          tow_d_array
        , iterate_sku_block
        , callback
      );
    };

    var get_product_info_id_for_each = function (id, callback){
      //sails.log.debug(id);
      var tow_d_array = transform_1d_array_to_2d_array_of_max(id);
      async.map(
          tow_d_array
        , iterate_id_block
        , callback
      );
    };

    var transform_block_results = function (blocks, callback) {
      var result = [];

      for (var i = 0; i < blocks.length; i++) {
        for (var k = blocks[i].length - 1; k >= 0; k--) {
          result.push(blocks[i][k]);
        };
      };

      callback(null, result);
    }

    var get_infos_by_skus = function (callback) {
      async.waterfall([
          get_product_list
        , extract_skus_from_product_list
        , get_product_info_sku_for_each
        , transform_block_results
      ],final_callback);
    }

    var get_infos_by_ids = function (callback) {
      // get infos by id
      async.waterfall([
          get_product_list
        , extract_ids_from_product_list
        , get_product_info_id_for_each
        , transform_block_results
      ],final_callback);
    }

    get_infos_by_ids(final_callback);

  }

};

//////////////                 //////////////////////////////////////////
////////////// Private Methods //////////////////////////////////////////
//////////////                 //////////////////////////////////////////

var get = function (method, params, cb) {
  var method_url = "";
  var method_query = { sToken : sails.config.vwh.sToken };
  var api_url = sails.config.vwh.api_url;

  if(params) {
    // If params is an array, save length and convert to comma separated string
    if(params instanceof Array) {
      var number = params.length;
      params = params.join(",");
    } else { // If params is not an array, save count of commas
      var number = params.split(',').length;
      // params = encodeURIComponent(params);
    }
  } else { 
    var number = 0;
  }

  var error = "";
  switch (method) {
    case 'product_info':
    case 'product_info_sku':
      method_url = sails.config.vwh.product_info_url;
      method_query[sails.config.vwh.product_info_query] = params;
    break;
    case 'product_info_id':
      method_url = sails.config.vwh.product_info_url;
      method_query[sails.config.vwh.product_info_id_query] = params;
    break;
    case 'product_list':
      method_url = sails.config.vwh.product_list_url;
    break;
    case 'image_info':
      method_url = sails.config.vwh.image_info_url;
      method_query[sails.config.vwh.image_info_query] = params;
    break;
    default:
      error = "Unknown method";
      sails.log.error(error);
      cb(error, null)
    break;
  }

  switch (method) {
    case 'product_info':
    case 'product_info_id':
    case 'product_info_sku':
    case 'image_info':
      if (number > 1) {
        var request_url = api_url + method_url;
        var request_qs = method_query;
      } else {
        var request_url = api_url + method_url + "/" + params;
        var request_qs = {sToken : method_query.sToken};
      }
    break;
    case 'product_list':
      var request_url = api_url + method_url;
      var request_qs = {sToken : method_query.sToken};
    break;
  }

  var url_final = request_url + "?" + qs.stringify(request_qs).replace(/%2C/g, ',');;

  // sails.log.debug("request_url: "+request_url);
  // sails.log.debug("query string: ");
  // sails.log.debug(request_qs);
  sails.log.debug("final_url: "+url_final);

  var method = method;

  //request({url: request_url, qs: request_qs, json: true}, function (error, response, body) {
  request({url: url_final, json: true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //sails.log.error("statusCode: "+response.statusCode);
      //sails.log.info(response);
      switch (method) {
        case 'product_info':
        case 'product_info_id':
        case 'product_info_sku':
        case 'product_list':
        case 'image_info':
          var body = normalize (body, method);
        break;
        
      }
      if(!error && !(body instanceof Array))
        body = [body];
     //sails.log.info(body);
      cb(null, body);
    } else {
      sails.log.error(error);
      // sails.log.error("statusCode: "+response.statusCode);
      sails.log.error("on url: "+url_final);
      sails.log.error("response: "+response);
      //sails.log.info(response);
      if(typeof(response) === 'undefined')
        response = {};
      if(typeof(response.statusCode) === 'undefined')
        response.statusCode = 500;
      cb({error: error, status: response.statusCode}, null);
    }
  });
}

/*
 * Zerteilt die description in einzele Attribute
 */
var normalizeDescription = function (product) {
  var description = {};
  product.originaldescription = product.DESCRIPTION;
  description.values = product.DESCRIPTION.toString().split('$');
  //description.names = new Array(description.values.length);

  switch (description.values.length) {
    // do not make a break in this switch case statement!
    default:
      // sails.log.warn("unknown value in description:");
      // sails.log.warn(description.values);
    case 6:
      // sails.log.warn("unknown value in description:");
      // sails.log.warn(description.values[5]);
    case 5:
      var metrics = description.values[4].replace(/\'/g, "&#39;");
      if(metrics.length > 1) {
        product.metrics = metrics.split("\r\n");
        // ersten Eintrag loeschen, dieser hat keinen Inhalt.
        product.metrics.splice(0, 1);
      }
    case 4:
      product.fittinginfo = description.values[3].replace(/\r\n/g, "<br>");
    case 3:
      product.quality = description.values[2].replace(/\r\n/g, "");
    case 2:
      product.description = description.values[1].replace(/\r\n/g, "<br>");
    case 1:
      product.applications = description.values[0].split("\r\n");//.replace(/\r/g, "").replace(/\n/g, "");
      // letzten Eintrag loeschen, dieser hat keinen Inhalt.
      product.applications.splice(product.applications.length-1, product.applications.length-1);
      delete product.DESCRIPTION;
    case 0:
  }
  return product;
};
/*
 * Transformiert das Request-Ergebniss in ein besser behandelbares Format 
 */
var normalizeProduct = function (data) {
  if (typeof(data.DESCRIPTION) !== 'undefined') {
    data = normalizeDescription (data);
  }
  if (typeof(data.ITEMNUMBER) !== 'undefined') {
    data.sku = data.ITEMNUMBER;
    delete data.ITEMNUMBER;
  }
  if (typeof(data.CODE) !== 'undefined') {
    data.sku = data.CODE;
    delete data.CODE;
  }
  if (typeof(data.sku) !== 'undefined') {
    data.sku_clean = data.sku.replace(/\/|-|\.|\s/g, "");
  }
  if (typeof(data.ITEMID) !== 'undefined') {
    data.id = data.ITEMID;
    delete data.ITEMID;
  }
  if (typeof(data.ITEMNAME) !== 'undefined') {
    data.name = data.ITEMNAME;
    delete data.ITEMNAME;
  }
  if (typeof(data.SPECIALORDER) !== 'undefined') {
    if(data.SPECIALORDER == "n")
      data.special_order = false;
    else
      data.special_order = true;
    delete data.SPECIALORDER;
  }
  if (typeof(data.FREESTOCKQUANTITY) !== 'undefined') {
    data.free_stock_quantity = data.FREESTOCKQUANTITY;
    delete data.FREESTOCKQUANTITY;
  }
  if (typeof(data.RETAILPRICE) !== 'undefined') {
    data.retail_price = data.RETAILPRICE;
    delete data.RETAILPRICE;
  }
  if (typeof(data.COSTPRICE) !== 'undefined') {
    data.cost_price = data.COSTPRICE;
    delete data.COSTPRICE;
  }
  if (typeof(data.COSTPRICE) !== 'undefined') {
    data.cost_price = data.COSTPRICE;
    delete data.COSTPRICE;
  }
  if (typeof(data.DUEWEEKS) !== 'undefined') {
    data.dueweeks = data.DUEWEEKS;
    delete data.DUEWEEKS;
  }
  if (typeof(data.WEIGHT) !== 'undefined') {
    data.weight = data.WEIGHT;
    delete data.WEIGHT;
  }
  if (typeof(data.AVAILABILITYMESSAGECODE) !== 'undefined') {
    data.availability_message_code = data.AVAILABILITYMESSAGECODE;
    delete data.AVAILABILITYMESSAGECODE;
  }
  if (typeof(data.AVAILABILITYMESSAGECODE) !== 'undefined') {
    data.availability_message_code = data.AVAILABILITYMESSAGECODE;
    delete data.AVAILABILITYMESSAGECODE;
  }
  if (typeof(data.PRICE2) !== 'undefined') {
    data.price_2 = data.PRICE2;
    delete data.PRICE2;
  }
  if (typeof(data.PRICE3) !== 'undefined') {
    data.price_3 = data.PRICE3;
    delete data.PRICE3;
  }
  if (typeof(data.PRICE4) !== 'undefined') {
    data.price_4 = data.PRICE4;
    delete data.PRICE4;
  }
  return data;
};

var normalize = function (data, method) {

  var result = [];

  if(method === 'product_info' || method ===  'product_info_id' || method ===  'product_info_sku' || method === 'product_list') {

    for (var i = 0; i < data.ROWCOUNT; i++) {
      result[i] = {};
      Object.keys(data.DATA).forEach(function(key) {
        result[i][key] = data.DATA[key][i];
      });
      result[i] = normalizeProduct(result[i]);
    };

    if((method === 'product_info' || method ===  'product_info_id' || method ===  'product_info_sku') && data.ROWCOUNT > 1) {
      sails.log.warn("product_info gibt bei regulärer Nutzung nur das erste Element zurück!");
    }
  }

  if(method === 'image_info') {
    result[0] = [];
    // Unnötigen Key entfernen, z.B. item_99797 aus "item_99797": {"image_02": {}, "image_01": {}"
    Object.keys(data).forEach(function(item_id) {
      // image_01, image_02 usw zum array umwandeln
      Object.keys(data[item_id]).forEach(function(image_number) {
        result[0].push(data[item_id][image_number]);
      });
    });
  }
  return result;
};

