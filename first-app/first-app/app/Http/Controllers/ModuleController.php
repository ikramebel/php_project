<?php
namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function creeModule(Request $request)
    {
        // 1. Validation
        $validated = $request->validate([
            'nom' => 'required',
            'enseignant_id' => 'required|exists:enseignants,id',
            'filiere_id' => 'required|exists:filieres,id'
        ]);

        // 2. Création
        $module = Module::create($validated);

        // 3. Réponse JSON
        return response()->json(['message' => 'Module créé', 'data' => $module], 201);
    }


    public function getAllModules()
    {
        $modules = Module::with('filiere', 'enseignant.user')->get();
        return response()->json(['data' => $modules], 200);
    }


    public function getModuleById($id)
    {
        $module = Module::find($id);
        if (!$module) {
            return response()->json(['message' => 'Module non trouvé'], 404);
        }
        return response()->json(['data' => $module], 200);
    }


    public function updateModule(Request $request, $id)
    {
        $module = Module::find($id);
        if (!$module) {
            return response()->json(['message' => 'Module non trouvé'], 404);
        }

        // Validation
        $validated = $request->validate([
            'nom' => 'sometimes|required',
            'enseignant_id' => 'sometimes|required|exists:enseignants,id',
            'filiere_id' => 'sometimes|required|exists:filieres,id'
        ]);

        // Mise à jour
        $module->update($validated);

        return response()->json(['message' => 'Module mis à jour', 'data' => $module], 200);
    }


    public function deleteModule($id)
    {
        $module = Module::find($id);
        if (!$module) {
            return response()->json(['message' => 'Module non trouvé'], 404);
        }

        $module->delete();
        return response()->json(['message' => 'Module supprimé'], 200);
    }

    function getModulesByFiliere($filiere_id)
    {
        $modules = Module::where('filiere_id', $filiere_id)->get();
        return response()->json(['data' => $modules], 200);
    }
    function getModulesByEnseignant($enseignant_id)
    {
        $modules = Module::where('enseignant_id', $enseignant_id)->get();
        return response()->json(['data' => $modules], 200);
    }
}