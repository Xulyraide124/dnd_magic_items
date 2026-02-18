package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

// Structures pour mapper le JSON de l'API D&D 5e
type MagicItem struct {
	Index string `json:"index"`
	Name  string `json:"name"`
	URL   string `json:"url"`
}

type APIResponse struct {
	Count   int         `json:"count"`
	Results []MagicItem `json:"results"`
}

func main() {
	// 1. Chargement des variables d'environnement
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erreur : Impossible de charger le fichier .env")
	}

	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		log.Fatal("Erreur : API_URL non définie dans le .env")
	}

	// Construction de l'URL pour les objets magiques
	fullURL := apiURL + "magic-items"

	// 2. Requête HTTP GET
	resp, err := http.Get(fullURL)
	if err != nil {
		log.Fatalf("Erreur lors de l'appel API : %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Erreur API : Status %d", resp.StatusCode)
	}

	// 3. Décodage du JSON
	var data APIResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Fatalf("Erreur de décodage JSON : %v", err)
	}

	// 4. Affichage propre des résultats
	fmt.Printf("--- Liste des %d Objets Magiques (D&D 5e) ---\n", data.Count)
	for _, item := range data.Results {
		fmt.Printf("[%s] - %s\n", item.Index, item.Name)
	}
}
