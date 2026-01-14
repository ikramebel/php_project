<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\Console\Input\Input;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class EtudiantController extends Controller
{
    public function createEtudiant(Request $request)
    {


        // Validation avec messages personnalisés
        $request->validate(
            [
            'name' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'apogee' => 'required|string|unique:etudiants,apogee',
            'filiere_id' => 'required|exists:filieres,id',
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'email.required' => 'L’email est obligatoire.',
            'email.email' => 'L’email doit être valide.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
            'apogee.required' => 'Le numéro Apogée est obligatoire.',
            'apogee.unique' => 'Ce numéro Apogée est déjà utilisé.',
            'filiere_id.required' => 'La filière est obligatoire.',
            'filiere_id.exists' => 'La filière sélectionnée n’existe pas.',
        ]);
    
    

        // Créer le user d'abord
        $user = User::create([
            'name' => $request->name,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'etudiant',
        ]);

        // Créer l'étudiant lié avec user_id
        $etudiant = Etudiant::create([
            'user_id' => $user->id,
            'apogee' => $request->apogee,
            'filiere_id' => $request->filiere_id,
            'semestre' => $request->semestre ?? 'S1',
            'annee_universitaire' => $request->annee_universitaire ?? '2025-2026',
        ]);

        // Fusionner les infos dans un seul JSON
        return response()->json([
            'id' => $etudiant->id,
            'name' => $user->name,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'apogee' => $etudiant->apogee,
            'role' => $user->role,
            'password' => $user->password,
            'filiere_id' => $etudiant->filiere_id,
            'semestre' => $etudiant->semestre,
            'annee_universitaire' => $etudiant->annee_universitaire,
        ]);
    }


    function getAllEtudiant()
    {
        $etudiants = Etudiant::with('user', 'filiere')->get();

        return $etudiants->map(function ($etd) {
            return [
                'id' => $etd->id,
                'name' => $etd->user->name ?? null,
                'prenom' => $etd->user->prenom ?? null,
                'email' => $etd->user->email ?? null,
                'apogee' => $etd->apogee,
                'password' => $etd->user->password ?? null,
                'filiere' => $etd->filiere->nom ?? null,
                'filiere_id' => $etd->filiere_id,
                'semester' => intval(substr($etd->semestre, 1)), // Convert S1 to 1
                'annee_universitaire' => $etd->annee_universitaire,
            ];
        });
    }


    function getEtudiant($id)
    {
        $etd = Etudiant::with('user')->find($id);

        if (!$etd) {
            return response()->json(['error' => 'Étudiant non trouvé'], 404);
        }


        return [
            'id' => $etd->id,
            'name' => $etd->user->name ?? null,
            'prenom' => $etd->user->prenom ?? null,
            'email' => $etd->user->email ?? null,
            'apogee' => $etd->apogee,
            'password' => $etd->user->password ?? null,
            'filiere_id' => $etd->filiere_id,
        ];
    }

    function updateEtudiant(Request $request, $id)
    {
        $etd = Etudiant::with('user')->find($id);
        if (!$etd) {
            return response()->json(['error' => 'Étudiant non trouvé'], 404);
        }

         // Vérifier si l'apogée existe déjà pour un autre étudiant
         if ($request->filled('apogee')) {
            $exists = Etudiant::where('apogee', $request->apogee)
                ->where('id', '!=', $etd->id)
                ->exists();
            if ($exists) {
                return response()->json(['message' => 'Un autre étudiant possède déjà cet apogée.'], 400);
            }
        }

        // Mettre à jour les informations de l'utilisateur  
        $etd->user->name = $request->input('name', $etd->user->name);
        $etd->user->prenom = $request->input('prenom', $etd->user->prenom);
        $etd->user->email = $request->input('email', $etd->user->email);
        if ($request->has('password')) {
            $etd->user->password = bcrypt($request->input('password'));
        }
        $etd->user->save();

        // Mettre à jour les informations de l'étudiant
        $etd->apogee = $request->input('apogee', $etd->apogee);
        $etd->filiere_id = $request->input('filiere_id', $etd->filiere_id);
        $etd->save();

        return response()->json([
            'id' => $etd->id,
            'name' => $etd->user->name,
            'prenom' => $etd->user->prenom,
            'email' => $etd->user->email,
            'apogee' => $etd->apogee,
            'password' => $etd->user->password,
            'filiere_id' => $etd->filiere_id,
        ]);
    }



    function deleteEtudiant($id)
    {
        // Charger l'étudiant avec son utilisateur
        $etudiant = Etudiant::with('user')->find($id);

        if (!$etudiant) {
            return response()->json(['error' => 'Étudiant non trouvé'], 404);
        }

        // Démarrer une transaction pour garantir la cohérence
        DB::transaction(function () use ($etudiant) {
            // Supprimer d'abord l'étudiant (optionnel, mais clair)
            $etudiant->delete();

            // Supprimer l'utilisateur associé
            $etudiant->user->delete();
        });

        return response()->json(['message' => 'Étudiant supprimé avec succès']);
    }


function getEtudiantsByFiliere($filiere_id)
    {
        $etudiants = Etudiant::with('user')
            ->where('filiere_id', $filiere_id)
            ->get();

        return $etudiants->map(function ($etd) {
            return [
                'id' => $etd->id,
                'name' => $etd->user->name ?? null,
                'prenom' => $etd->user->prenom ?? null,
                'email' => $etd->user->email ?? null,
                'apogee' => $etd->apogee,
                'filiere_id' => $etd->filiere_id,
            ];
        });
    }

}
