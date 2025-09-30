package main

import (
	"log"
	"net/http"
	"smsIntern/sms-kadai/backend/api"
)

func main() {
	http.HandleFunc("/test", api.TestHandler)
	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
