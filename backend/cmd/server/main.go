package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Data contract matching the frontend serialization output
type PipelineJob struct {
	ProblemID string `json:"problem_id"`
	Graph     struct {
		Nodes []map[string]interface{} `json:"nodes"`
		Edges []map[string]interface{} `json:"edges"`
	} `json:"graph"`
}

// Global channel behaving as our evaluation task buffer
var jobQueue = make(chan PipelineJob, 100)

func main() {
	// Spin up 3 concurrent background processing workers
	for w := 1; w <= 3; w++ {
		go evaluationWorker(w, jobQueue)
	}

	http.HandleFunc("/api/evaluate", handleSubmission)
	fmt.Println("ArchForge Backend engine listening locally on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleSubmission(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var job PipelineJob
	if err := json.NewDecoder(r.Body).Decode(&job); err != nil {
		http.Error(w, "Malformed architectural representation", http.StatusBadRequest)
		return
	}

	// Non-blocking write to our high-throughput internal queue
	select {
	case jobQueue <- job:
		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte(`{"status": "queued", "message": "Architecture sent to AI Evaluation cluster"}`))
	default:
		http.Error(w, "Evaluation buffer overflow, workers saturated", http.StatusServiceUnavailable)
	}
}

func evaluationWorker(workerID int, queue <-chan PipelineJob) {
	for job := range queue {
		fmt.Printf("[Worker %d] Polled job for system: %s. Initiating topology traversal...\n", workerID, job.ProblemID)
		
		// Simulate network latency or AI inference delay
		time.Sleep(2 * time.Second) 
		
		fmt.Printf("[Worker %d] Finished processing job for %s. Dispatched evaluation states.\n", workerID, job.ProblemID)
	}
}