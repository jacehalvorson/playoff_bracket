/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "playoffbrackets";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

// "key" takes the form "{year}{group}" e.g., "2025nelsons"

const userIdPresent = false;
const partitionKeyName = "key";
const partitionKeyType = "S";
const sortKeyName = "player";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/brackets";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// convert url string param to expected Type
const convertUrlType = (param, type) =>
{
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

/************************************
* HTTP Get method to list objects *
************************************/

app.get(path, async function(req, res)
{
  var params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES'
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});

/************************************
 * HTTP Get method to query all objects from a given year *
 ************************************/

app.get(path + '/:year', async function(req, res)
{
  if ( !/^[0-9]{4}$/.test( req.params['year'] ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid year "' + req.params['year'] + '"'});
    return;
  }

  var params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
    FilterExpression: 'contains(#key, :year)',
    ExpressionAttributeNames: {
      '#key': 'key'
    },
    ExpressionAttributeValues: {
      ':year': req.params['year']
    }
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});

/*****************************************
 * HTTP Get method for all objects within a group within a year *
 *****************************************/

app.get(path + '/:year' + '/:group', async function(req, res)
{
  if ( !/^[0-9]{4}$/.test( req.params['year'] ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid year'});
    return;
  }
  if ( !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( req.params['group'] ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid group'});
    return;
  }

  const condition = {}

  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]['AttributeValueList'] = [ req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  } else {
    try {
      condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params['year'] + req.params['group'], partitionKeyType) ];
    } catch(err) {
      res.statusCode = 400;
      res.json({error: 'Wrong column type ' + err});
      return;
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});


/************************************
* HTTP put method for insert object *
*************************************/

app.put(path, async function(req, res)
{
  if (userIdPresent) {
    req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }
  try {
    let data = await ddbDocClient.send(new PutCommand(putItemParams));
    res.json({ success: 'put call succeed!', url: req.url, data: data })
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

/************************************
* HTTP post method for insert object *
*************************************/

app.post(path, async function(req, res)
{
  if ( !req.body['key'] || !/^[0-9]{4}$/.test( req.body['key'].substring( 0, 4 ) ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid year'});
    return;
  }
  if ( !req.body['key'] || !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( req.body['key'].substring( 4 ) ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid group'});
    return;
  }
  if ( !req.body['player'] || !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( req.body['player'] ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid player'});
    return;
  }

  if (userIdPresent) {
    req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }
  try {
    let data = await ddbDocClient.send(new PutCommand(putItemParams));
    res.json({ success: 'post call succeed!', url: req.url, data: data })
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

/**************************************
* HTTP remove method to delete object *
***************************************/

app.delete(path + '/:year' + '/:group' + '/:player', async function(req, res)
{
  const params = {};

  if ( !req.params['year'] || !/^[0-9]{4}$/.test( req.params['year'] ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid year'});
    return;
  }
  if ( !req.params['group'] || !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( req.params['group'] ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid group'});
    return;
  }
  if ( !req.params['player'] || !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( req.params['player'] ) )
  {
    res.statusCode = 400;
    res.json({error: 'Invalid player'});
    return;
  }

  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params['year'] + req.params['group'];
     try {
      params[partitionKeyName] = convertUrlType(req.params['year'] + req.params['group'], partitionKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(req.params['player'], sortKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  let removeItemParams = {
    TableName: tableName,
    Key: params
  }

  try {
    let data = await ddbDocClient.send(new DeleteCommand(removeItemParams));
    res.json({url: req.url, data: data});
  } catch (err) {
    res.statusCode = 500;
    res.json({error: err, url: req.url});
  }
});

app.listen(3000, function() {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
