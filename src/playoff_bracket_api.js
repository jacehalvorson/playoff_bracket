import { get, post } from 'aws-amplify/api';

async function fetchAPI( apiName, path )
{
   try
   {
      const restOperation = get(
      {
         apiName: apiName,
         path: path
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      console.log('GET call succeeded: ');
      console.log(response);
      return response;
   }
   catch (e)
   {
      console.log('GET call failed: ', JSON.parse(e.response.body));
      return e.response;
   }
}

async function postAPI( apiName, path, inputBody )
{
   try
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

      console.log('POST call succeeded: ');
      console.log(response);
      return response;
   }
   catch (e)
   {
      console.log('POST call failed: ', JSON.parse(e.response.body));
      return e.response;
   }
}

export { fetchAPI, postAPI };
