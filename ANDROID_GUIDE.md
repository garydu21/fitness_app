# 📱 Guide Android - Connexion à l'API

## 🔧 Configuration Android

### 1. Ajouter les dépendances dans `build.gradle` (Module: app)

```gradle
dependencies {
    // Retrofit pour les appels API
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    
    // OkHttp pour les logs
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    
    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // ViewModel et LiveData
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.2'
    
    // Jetpack Compose (si tu l'utilises)
    implementation platform('androidx.compose:compose-bom:2023.10.01')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.material3:material3'
}
```

### 2. Ajouter la permission Internet dans `AndroidManifest.xml`

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:usesCleartextTraffic="true"
        ... >
    </application>
</manifest>
```

**Note:** `usesCleartextTraffic="true"` est nécessaire pour les URLs HTTP (localhost). En production avec HTTPS, tu peux le retirer.

---

## 📦 Structure des classes

### 1. Models (data class)

Crée un package `models` :

```kotlin
package com.example.fitnessapp.models

data class User(
    val id: Int,
    val nom: String,
    val email: String
)

data class AuthResponse(
    val message: String,
    val token: String? = null,
    val user: User? = null,
    val userId: Int? = null
)

data class RegisterRequest(
    val nom: String,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class Exercice(
    val id: Int,
    val nom: String,
    val groupe_musculaire: String,
    val description: String?,
    val image_url: String?,
    val created_by_user_id: Int?
)

data class Programme(
    val id: Int,
    val nom: String,
    val description: String?,
    val exercices: List<ProgrammeExercice>? = null
)

data class ProgrammeExercice(
    val exercice_id: Int,
    val nom: String? = null,
    val groupe_musculaire: String? = null,
    val ordre: Int,
    val series: Int,
    val reps_cible: Int
)

data class CreateProgrammeRequest(
    val nom: String,
    val description: String?,
    val exercices: List<ExerciceRequest>
)

data class ExerciceRequest(
    val exercice_id: Int,
    val series: Int,
    val reps_cible: Int
)

data class Performance(
    val exercice_id: Int,
    val serie_num: Int,
    val reps: Int,
    val poids: Double,
    val notes: String? = null
)

data class CreateSeanceRequest(
    val programme_id: Int?,
    val date: String? = null,
    val duree: Int?,
    val notes: String?,
    val performances: List<Performance>
)

data class Seance(
    val id: Int,
    val date: String,
    val duree: Int?,
    val notes: String?,
    val programme_nom: String?,
    val performances: List<PerformanceDetail>? = null
)

data class PerformanceDetail(
    val id: Int,
    val exercice_nom: String,
    val groupe_musculaire: String,
    val serie_num: Int,
    val reps: Int,
    val poids: Double,
    val notes: String?
)

data class ExerciceStats(
    val stats: Stats,
    val derniere_performance: DernierePerformance?
)

data class Stats(
    val meilleur_poids: Double,
    val meilleur_reps: Int,
    val nombre_seances: Int,
    val volume_total: Double
)

data class DernierePerformance(
    val date: String,
    val poids: Double,
    val reps: Int,
    val serie_num: Int
)
```

---

### 2. Interface API

Crée un package `network` avec `FitnessApi.kt` :

```kotlin
package com.example.fitnessapp.network

import com.example.fitnessapp.models.*
import retrofit2.Response
import retrofit2.http.*

interface FitnessApi {
    
    // Authentication
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    // Exercices
    @GET("exercices")
    suspend fun getExercices(@Header("Authorization") token: String): Response<List<Exercice>>
    
    @GET("exercices/{id}")
    suspend fun getExercice(
        @Header("Authorization") token: String,
        @Path("id") exerciceId: Int
    ): Response<Exercice>
    
    @POST("exercices")
    suspend fun createExercice(
        @Header("Authorization") token: String,
        @Body exercice: Exercice
    ): Response<Map<String, Any>>
    
    @PUT("exercices/{id}")
    suspend fun updateExercice(
        @Header("Authorization") token: String,
        @Path("id") exerciceId: Int,
        @Body exercice: Exercice
    ): Response<Map<String, String>>
    
    @DELETE("exercices/{id}")
    suspend fun deleteExercice(
        @Header("Authorization") token: String,
        @Path("id") exerciceId: Int
    ): Response<Map<String, String>>
    
    // Programmes
    @GET("programmes")
    suspend fun getProgrammes(@Header("Authorization") token: String): Response<List<Programme>>
    
    @GET("programmes/{id}")
    suspend fun getProgramme(
        @Header("Authorization") token: String,
        @Path("id") programmeId: Int
    ): Response<Programme>
    
    @POST("programmes")
    suspend fun createProgramme(
        @Header("Authorization") token: String,
        @Body request: CreateProgrammeRequest
    ): Response<Map<String, Any>>
    
    @DELETE("programmes/{id}")
    suspend fun deleteProgramme(
        @Header("Authorization") token: String,
        @Path("id") programmeId: Int
    ): Response<Map<String, String>>
    
    // Séances
    @GET("seances")
    suspend fun getSeances(@Header("Authorization") token: String): Response<List<Seance>>
    
    @GET("seances/{id}")
    suspend fun getSeance(
        @Header("Authorization") token: String,
        @Path("id") seanceId: Int
    ): Response<Seance>
    
    @POST("seances")
    suspend fun createSeance(
        @Header("Authorization") token: String,
        @Body request: CreateSeanceRequest
    ): Response<Map<String, Any>>
    
    @DELETE("seances/{id}")
    suspend fun deleteSeance(
        @Header("Authorization") token: String,
        @Path("id") seanceId: Int
    ): Response<Map<String, String>>
    
    // Stats
    @GET("stats/exercice/{id}")
    suspend fun getExerciceProgression(
        @Header("Authorization") token: String,
        @Path("id") exerciceId: Int
    ): Response<List<Map<String, Any>>>
    
    @GET("stats/exercice/{id}/summary")
    suspend fun getExerciceStats(
        @Header("Authorization") token: String,
        @Path("id") exerciceId: Int
    ): Response<ExerciceStats>
    
    @GET("stats/exercice/{id}/chart")
    suspend fun getExerciceChartData(
        @Header("Authorization") token: String,
        @Path("id") exerciceId: Int
    ): Response<List<Map<String, Any>>>
    
    @GET("stats/global")
    suspend fun getGlobalStats(
        @Header("Authorization") token: String
    ): Response<Map<String, Any>>
}
```

---

### 3. Retrofit Client

Crée `RetrofitClient.kt` dans le package `network` :

```kotlin
package com.example.fitnessapp.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    
    // Change cette URL si tu déploies sur un serveur
    private const val BASE_URL = "http://10.0.2.2:3000/api/" // Pour l'émulateur Android
    // Si tu testes sur un vrai téléphone : "http://TON_IP_LOCAL:3000/api/"
    // Exemple : "http://192.168.1.10:3000/api/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val api: FitnessApi = retrofit.create(FitnessApi::class.java)
}
```

**Important :** 
- Pour l'émulateur Android : utilise `10.0.2.2` (c'est l'IP du localhost de ton PC)
- Pour un téléphone réel : trouve ton IP locale avec `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)

---

### 4. Repository

Crée `FitnessRepository.kt` dans le package `repository` :

```kotlin
package com.example.fitnessapp.repository

import com.example.fitnessapp.models.*
import com.example.fitnessapp.network.RetrofitClient

class FitnessRepository {
    
    private val api = RetrofitClient.api
    
    // Auth
    suspend fun register(nom: String, email: String, password: String) =
        api.register(RegisterRequest(nom, email, password))
    
    suspend fun login(email: String, password: String) =
        api.login(LoginRequest(email, password))
    
    // Exercices
    suspend fun getExercices(token: String) = api.getExercices("Bearer $token")
    
    suspend fun createExercice(token: String, exercice: Exercice) =
        api.createExercice("Bearer $token", exercice)
    
    // Programmes
    suspend fun getProgrammes(token: String) = api.getProgrammes("Bearer $token")
    
    suspend fun createProgramme(token: String, request: CreateProgrammeRequest) =
        api.createProgramme("Bearer $token", request)
    
    // Séances
    suspend fun getSeances(token: String) = api.getSeances("Bearer $token")
    
    suspend fun createSeance(token: String, request: CreateSeanceRequest) =
        api.createSeance("Bearer $token", request)
    
    // Stats
    suspend fun getExerciceStats(token: String, exerciceId: Int) =
        api.getExerciceStats("Bearer $token", exerciceId)
}
```

---

### 5. ViewModel Exemple

Crée `ExercicesViewModel.kt` dans le package `viewmodel` :

```kotlin
package com.example.fitnessapp.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fitnessapp.models.Exercice
import com.example.fitnessapp.repository.FitnessRepository
import kotlinx.coroutines.launch

class ExercicesViewModel : ViewModel() {
    
    private val repository = FitnessRepository()
    
    private val _exercices = MutableLiveData<List<Exercice>>()
    val exercices: LiveData<List<Exercice>> = _exercices
    
    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    fun loadExercices(token: String) {
        viewModelScope.launch {
            try {
                _loading.value = true
                _error.value = null
                
                val response = repository.getExercices(token)
                
                if (response.isSuccessful) {
                    _exercices.value = response.body() ?: emptyList()
                } else {
                    _error.value = "Erreur: ${response.code()}"
                }
            } catch (e: Exception) {
                _error.value = "Erreur réseau: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }
}
```

---

### 6. Exemple d'utilisation dans une Activity

```kotlin
package com.example.fitnessapp

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.fitnessapp.viewmodel.ExercicesViewModel

class MainActivity : AppCompatActivity() {
    
    private val exercicesViewModel: ExercicesViewModel by viewModels()
    private var authToken: String? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Récupère le token (depuis SharedPreferences par exemple)
        authToken = getSharedPreferences("app_prefs", MODE_PRIVATE)
            .getString("auth_token", null)
        
        // Observer les exercices
        exercicesViewModel.exercices.observe(this) { exercices ->
            // Mettre à jour ton UI ici
            println("Exercices récupérés: ${exercices.size}")
        }
        
        exercicesViewModel.error.observe(this) { error ->
            error?.let {
                // Afficher l'erreur à l'utilisateur
                println("Erreur: $it")
            }
        }
        
        // Charger les exercices
        authToken?.let {
            exercicesViewModel.loadExercices(it)
        }
    }
}
```

---

## 🎯 Gestion du Token

Crée une classe `TokenManager.kt` :

```kotlin
package com.example.fitnessapp.utils

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {
    
    private val prefs: SharedPreferences = 
        context.getSharedPreferences("fitness_app_prefs", Context.MODE_PRIVATE)
    
    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
    }
    
    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }
    
    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }
    
    fun saveUser(userId: Int, name: String, email: String) {
        prefs.edit()
            .putInt(KEY_USER_ID, userId)
            .putString(KEY_USER_NAME, name)
            .putString(KEY_USER_EMAIL, email)
            .apply()
    }
    
    fun getUserId(): Int {
        return prefs.getInt(KEY_USER_ID, -1)
    }
    
    fun isLoggedIn(): Boolean {
        return getToken() != null
    }
    
    fun logout() {
        prefs.edit().clear().apply()
    }
}
```

---

## 📝 Notes importantes

1. **IP pour tester :**
   - Émulateur : `http://10.0.2.2:3000`
   - Téléphone réel : trouve ton IP locale

2. **Sécurité :**
   - En production, utilise HTTPS
   - Stocke le token de manière sécurisée (EncryptedSharedPreferences)

3. **Permissions :**
   - N'oublie pas `INTERNET` dans le Manifest

4. **Gestion des erreurs :**
   - Toujours vérifier `response.isSuccessful`
   - Gérer les exceptions réseau

---

## 🚀 Prochaines étapes

1. Implémenter l'écran de login
2. Créer la liste des exercices
3. Ajouter la création de programmes
4. Implémenter le tracking des séances
5. Ajouter les graphiques de progression

Bon code ! 💪
