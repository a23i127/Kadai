package dbdelete

import (
	"net/http"
	"smsIntern/sms-kadai/backend/db"

	"github.com/gin-gonic/gin"
)

// DBの全テーブルの中身を削除するAPIハンドラ
func DeleteAllDataHandler(c *gin.Context) {
	db.DB.Exec("DELETE FROM repositories")
	db.DB.Exec("DELETE FROM file_or_dirs")
	c.JSON(http.StatusOK, gin.H{"message": "All data deleted"})
}
