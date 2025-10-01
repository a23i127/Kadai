package db

import (
	"smsIntern/sms-kadai/backend/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(dbPath string) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return err
	}
	// テーブル自動マイグレーション
	if err := DB.AutoMigrate(&model.Repository{}, &model.FileOrDir{}); err != nil {
		return err
	}
	return nil
}
