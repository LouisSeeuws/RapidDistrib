import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getOptionalUser } from "~/auth.server";
import { commitUserToken } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "RapidDistrib" },
    { name: "description", content: "Connectez-vous ou créez votre compte!" },
  ];
};

export const loader = async ({ request } : LoaderFunctionArgs) => {
  const user = await getOptionalUser({request});
  return json({user});
}

export const action = async ({request} : ActionFunctionArgs) => {
  const formData = await request.formData();
  const jsonData = Object.fromEntries(formData);
  //const response = await fetch('http://preprod-api.rapid-distrib.fr:3000/auth/login', {
  const response = await fetch('http://preprod-api.rapid-distrib.fr:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData)
  });
  const token = await response.json();
  if(token.statusCode === 400 || token.statusCode === 500) return null;
  return json({},{
    headers: {
      "Set-Cookie": await commitUserToken({request, userToken: token}),
    }
  });
}

export default function Index() {
  const {user} = useLoaderData<typeof loader>();
  const isConnected = user !== null;
  return (
    <div className="font-sans p-4 flex flex-col items-center">
      {!isConnected ? <LoginForm/> : 
        <div className="font-sans p-4 text-center">
            <h1 className="text-3xl">RapidDistrib</h1>
            <h2>Bonjour {user.firstname} !</h2>
            <pre>{JSON.stringify(user, null, 4)}</pre> 
        </div> 
      }
    </div>
  );
}

const LoginForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 rounded-md shadow-md" style={{backgroundColor: "#91ebdb"}}>
      <h2 className="text-center text-2xl mb-4">Bienvenue...</h2>
      <p className="text-center mb-6">Connectez-vous ou créez votre compte !</p>
      <Form method="POST" className="flex flex-col items-center space-y-4">
        <input type="email" name="email" placeholder="Adresse email" required className="w-full p-2 border border-gray-300 rounded" />
        <input type="password" name="password" placeholder="Mot de passe" required className="w-full p-2 border border-gray-300 rounded" />
        <button type="submit" className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700">CONNEXION</button>
      </Form>
      <button onClick={openModal} className="text-sm text-center text-blue-700 mt-2 bg-transparent border-none cursor-pointer">Mot de passe oublié ?</button>
      <Link to="/register" className="mt-4 w-full p-2 text-white rounded hover:bg-yellow-700 text-center" style={{backgroundColor: "#5f79fd", display: 'block'}}>Je crée mon compte MyDistrib</Link>
      <ForgotPasswordModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const handleSubmit = async (event: { preventDefault: () => void; target: { email: { value: any; }; }; }) => {
    event.preventDefault();
    const email = event.target.email.value;

    await fetch('http://preprod-api.rapid-distrib.fr:3000/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px', position: 'relative' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Mot de passe oublié</h3>
        <p style={{ marginBottom: '16px' }}>Pour réinitialiser votre mot de passe, veuillez renseigner votre email</p>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Adresse email" required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '16px' }} />
          <button type="submit" style={{ width: '100%', padding: '8px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', cursor: 'pointer', border: 'none', fontSize: '16px' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>Envoyer</button>
        </form>
        <button onClick={onClose} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', fontSize: '18px', color: '#6b7280', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.color = '#4b5563'} onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}>×</button>
      </div>
    </div>
  );
};

