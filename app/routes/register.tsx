import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, Link, redirect, useActionData, useLoaderData } from "@remix-run/react";
import { getOptionalUser } from "~/auth.server";
import { commitUserToken, getUserToken } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request } : LoaderFunctionArgs) => {
  const user = await getOptionalUser({request});
  if(user !== null) return redirect("/");
  return json({})
}


export const action = async ({request}: ActionFunctionArgs) => {
    const formData = await request.formData();
    const jsonData = Object.fromEntries(formData);
    console.log(jsonData);
    
    const response = await fetch('http://preprod-api.rapid-distrib.fr:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });
    console.log(response);
  
    if (response.status === 201) {
      return redirect('/'
      );
    } else {
      return json({error: 'Erreur lors de la création du compte'}, {status: response.status});
    }
  }
//Gérer toutes les erreurs possibles

export default function RegisterForm() {
    const actionData = useActionData();
    
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 rounded-md shadow-md" style={{backgroundColor: "#91ebdb"}}>
        <Link to="/" className="absolute top-4 right-4 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-gray-700 hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <p className="text-center mb-6">Je crée mon compte My Distrib</p>
        
        {actionData?.error && (
          <p className="text-red-600 text-center mb-4">{actionData.error}</p>
        )}
  
        <Form method="POST" className="flex flex-col items-center space-y-4">
          <input type="text" name="firstname" placeholder="Prénom" required className="w-full p-2 border border-gray-300 rounded" />
          <input type="text" name="lastname" placeholder="Nom" required className="w-full p-2 border border-gray-300 rounded" />
          <input type="email" name="email" placeholder="Adresse email" required className="w-full p-2 border border-gray-300 rounded" />
          <input type="password" name="password" placeholder="Mot de passe" required className="w-full p-2 border border-gray-300 rounded" />
          <input type="password" name="passwordConfirmation" placeholder="Confirmation mot de passe" required className="w-full p-2 border border-gray-300 rounded" />
          <input type="phone" name="phone" placeholder="Téléphone" required className="w-full p-2 border border-gray-300 rounded" />
          <button type="submit" className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700">Je crée mon compte</button>
        </Form>
      </div>
    );
  }
