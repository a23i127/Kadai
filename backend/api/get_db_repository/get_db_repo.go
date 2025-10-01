package getdbrepository

import (
	"net/http"
	"smsIntern/sms-kadai/backend/db"
	"smsIntern/sms-kadai/backend/model"

	"github.com/gin-gonic/gin"
)

// GET /api/db/repos
func HandleGetRepositoriesCache(c *gin.Context) {
	var repos []model.Repository
	if err := db.DB.Find(&repos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, repos)
}
