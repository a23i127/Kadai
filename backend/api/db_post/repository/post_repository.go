package db_post

import (
	"net/http"
	"smsIntern/sms-kadai/backend/db"
	"smsIntern/sms-kadai/backend/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
)

// FileOrDirのバルクUPSERT APIハンドラ
// sqlを投げる回数減らしてパフォーマンス上げるために50件ずつバルク
// postの数＝クエリの数ではない

// RepositoryのバルクUPSERT APIハンドラ

func PostRepositoryBatch(c *gin.Context) {
	var items []model.Repository
	if err := c.ShouldBindJSON(&items); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "full_name"}},
		DoUpdates: clause.AssignmentColumns([]string{"name", "default_branch", "updated_at"}),
	}).CreateInBatches(items, 50).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"inserted": len(items)})
}
