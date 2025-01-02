import { get, post } from 'aws-amplify/api';

async function fetchAPI( apiName, path )
{
   const restOperation = get(
   {
      apiName: apiName,
      path: path
   });
   
   const { body } = await restOperation.response;
   const response = await body.json();

   return response;
}

async function postAPI( apiName, path, inputBody )
{
   const restOperation = post(
   {
      apiName: apiName,
      path: path,
      options: {
         headers: {
            "Content-Type": "application/json"
         },
         body: inputBody
      }
   });

   const { body } = await restOperation.response;
   const response = await body.json();

   return response;
}

export { fetchAPI, postAPI };
