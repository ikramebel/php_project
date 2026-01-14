<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;
    
    protected $fillable = ['nom', 'enseignant_id', 'filiere_id'];

    public function filiere() {
        return $this->belongsTo(Filiere::class); 
    }
    
    public function enseignant() {
        return $this->belongsTo(Enseignant::class);
    }
    
    public function seances() {
        return $this->hasMany(Seance::class);
    }
    
}