package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ルーター設定関数
func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	api := router.Group("/api")
	{
		// テストエンドポイント
		api.GET("/test", TestHandler)

		// モックエンドポイント（テスト用）
		api.GET("/db/repos", func(c *gin.Context) {
			c.JSON(http.StatusOK, []gin.H{
				{
					"id":   1,
					"name": "test-repo",
					"tag":  "test",
				},
			})
		})

		api.GET("/db/fileordir/:repoId/*path", func(c *gin.Context) {
			repoId := c.Param("repoId")
			path := c.Param("path")
			c.JSON(http.StatusOK, []gin.H{
				{
					"name":    "test-file.md",
					"path":    path,
					"repo_id": repoId,
					"type":    "file",
				},
			})
		})
	}

	return router
}

func TestHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "APIテスト成功！",
		"status":  "OK",
		"data": gin.H{
			"server":    "Backend API Server",
			"timestamp": "2024-10-16",
			"endpoints": []string{
				"GET /api/test",
				"GET /api/orgs/repos",
				"GET /api/db/repos",
				"POST /api/repository/create/batch",
				"POST /api/file-or-dir/create/batch/:repo_id",
				"DELETE /api/db/delete-all",
			},
		},
	})
}
