// DynamoDB helpers (AWS SDK v3)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE  = process.env.TABLE_NAME;

let ddbDoc;

function getClient() {
  if (!ddbDoc) {
    const ddb = new DynamoDBClient({ region: REGION });
    ddbDoc = DynamoDBDocumentClient.from(ddb);
  }
  return ddbDoc;
}

async function listMessages() {
  const client = getClient();
  const res = await client.send(new ScanCommand({ TableName: TABLE }));
  return res.Items || [];
}

async function createMessage({ id, name, message }) {
  const client = getClient();
  await client.send(new PutCommand({
    TableName: TABLE,
    Item: { id: String(id), name, message }
  }));
  return { id, name, message };
}

async function updateMessage(id, { name, message }) {
  const client = getClient();
  const res = await client.send(new UpdateCommand({
    TableName: TABLE,
    Key: { id: String(id) },
    UpdateExpression: "SET #n = :n, #m = :m",
    ExpressionAttributeNames: { "#n": "name", "#m": "message" },
    ExpressionAttributeValues: { ":n": name, ":m": message },
    ReturnValues: "ALL_NEW"
  }));
  return res.Attributes;
}

async function deleteMessage(id) {
  const client = getClient();
  await client.send(new DeleteCommand({
    TableName: TABLE,
    Key: { id: String(id) }
  }));
}

module.exports = {
  listMessages,
  createMessage,
  updateMessage,
  deleteMessage
};
