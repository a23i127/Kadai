package api

import (
	"net/http"
)

func TestHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("APIテスト成功"))
}
