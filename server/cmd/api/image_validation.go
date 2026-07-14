package main

import (
	"errors"
	"io"
	"net/http"
	"os"
	"strings"
)

const maxGeneratedImageBytes = 20 << 20

func writeRasterImage(path string, data []byte) error {
	if len(data) == 0 || len(data) > maxGeneratedImageBytes {
		return errors.New("generated image payload has invalid size")
	}
	contentType := strings.ToLower(http.DetectContentType(data))
	if contentType != "image/png" && contentType != "image/jpeg" && contentType != "image/webp" && contentType != "image/gif" {
		return errors.New("generated image payload is not a raster image")
	}
	return os.WriteFile(path, data, 0o644)
}

func writeRasterImageFromReader(path string, reader io.Reader) error {
	data, err := io.ReadAll(io.LimitReader(reader, maxGeneratedImageBytes+1))
	if err != nil {
		return err
	}
	return writeRasterImage(path, data)
}
