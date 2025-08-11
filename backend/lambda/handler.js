// Minimal Lambda API (Node 20) using DynamoDB
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  try {
    const m = event.requestContext.http.method;
    const p = event.requestContext.http.path;

    if (m === "GET" && p === "/messages") {
      const res = await ddb.send(new ScanCommand({ TableName: TABLE }));
      return json(200, res.Items ?? []);
    }
    if (m === "POST" && p === "/messages") {
      const body = JSON.parse(event.body || "{}");
      if (!body.name || !body.message) return json(400, { error:"name and message are required" });
      const item = { id: Date.now().toString(), name: body.name, message: body.message, createdAt: Date.now() };
      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return json(201, item);
    }
    const idMatch = p.match(/^\/messages\/(.+)$/);
    if (m === "PUT" && idMatch) {
      const id = idMatch[1];
      const body = JSON.parse(event.body || "{}");
      if (!body.name || !body.message) return json(400, { error:"name and message are required" });
      const res = await ddb.send(new UpdateCommand({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "SET #n=:n, #m=:m",
        ExpressionAttributeNames: { "#n": "name", "#m": "message" },
        ExpressionAttributeValues: { ":n": body.name, ":m": body.message },
        ReturnValues: "ALL_NEW"
      }));
      return json(200, res.Attributes);
    }
    if (m === "DELETE" && idMatch) {
      const id = idMatch[1];
      await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
      return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
    }
    return json(404, { error:"Not found" });
  } catch (e) {
    console.error(e);
    return json(500, { error:"Internal Server Error" });
  }
};
