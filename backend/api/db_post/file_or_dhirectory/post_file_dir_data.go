package file_or_dhirectory

import (
	"fmt"
	"net/http"
	"smsIntern/sms-kadai/backend/db"
	"smsIntern/sms-kadai/backend/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
)

// FileOrDirのバルクUPSERT APIハンドラ
func PostFileOrDirBatch(c *gin.Context) {
	repoIDStr := c.Param("repo_id")
	if repoIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repo_id is required as path parameter"})
		return
	}
	var repoID uint
	if _, err := fmt.Sscanf(repoIDStr, "%d", &repoID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repo_id"})
		return
	}

	var items []model.FileOrDir
	if err := c.ShouldBindJSON(&items); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	for i := range items {
		items[i].RepoID = repoID
	}
	if err := db.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "repo_id"}, {Name: "path"}},
		DoUpdates: clause.AssignmentColumns([]string{"name", "type", "url", "content", "fetched_at"}),
	}).CreateInBatches(items, 50).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"inserted": len(items)})
}
