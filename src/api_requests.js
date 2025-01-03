import { get, post, del } from 'aws-amplify/api';

export async function fetchAPI( apiName, path )
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

export async function postAPI( apiName, path, inputBody )
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

export async function deleteAPI( apiName, path )
{
   const restOperation = del(
   {
      apiName: apiName,
      path: path
   });

   const { body } = await restOperation.response;
   const response = await body.json();

   return response;
}
