#!/bin/bash

# 🚀 ECS Deployment Fix Script
# Creates CloudWatch log group and monitors deployment

set -e

# Configuration
LOG_GROUP="/ecs/clubapp-backend"
REGION="us-east-1"
CLUSTER="clubapp-dev-ecs"
SERVICE="clubapp-dev-svc"
RETENTION_DAYS=7
MAX_WAIT_TIME=600  # 10 minutes
CHECK_INTERVAL=10   # 10 seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    print_success "AWS CLI found"
}

# Check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity --region $REGION &> /dev/null; then
        print_error "AWS credentials not configured or invalid"
        exit 1
    fi
    print_success "AWS credentials valid"
}

# Create CloudWatch log group
create_log_group() {
    print_header "Step 1: Creating CloudWatch Log Group"
    
    # Check if log group already exists
    if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --region $REGION | grep -q "\"logGroupName\": \"$LOG_GROUP\""; then
        print_warning "Log group already exists: $LOG_GROUP"
        return 0
    fi
    
    print_info "Creating log group: $LOG_GROUP"
    aws logs create-log-group \
        --log-group-name "$LOG_GROUP" \
        --region $REGION
    
    print_success "Log group created: $LOG_GROUP"
}

# Set log retention
set_retention_policy() {
    print_header "Step 2: Setting Log Retention Policy"
    
    print_info "Setting retention to $RETENTION_DAYS days"
    aws logs put-retention-policy \
        --log-group-name "$LOG_GROUP" \
        --retention-in-days $RETENTION_DAYS \
        --region $REGION
    
    print_success "Retention policy set to $RETENTION_DAYS days"
}

# Wait for tasks to start
wait_for_tasks() {
    print_header "Step 3: Waiting for Tasks to Start"
    
    local elapsed=0
    local running_count=0
    local desired_count=0
    
    print_info "Waiting for ECS to retry failed tasks..."
    print_info "This may take 1-2 minutes..."
    echo ""
    
    while [ $elapsed -lt $MAX_WAIT_TIME ]; do
        # Get service status
        SERVICE_INFO=$(aws ecs describe-services \
            --cluster $CLUSTER \
            --services $SERVICE \
            --region $REGION \
            --query 'services[0]' \
            --output json)
        
        running_count=$(echo "$SERVICE_INFO" | jq '.runningCount')
        desired_count=$(echo "$SERVICE_INFO" | jq '.desiredCount')
        status=$(echo "$SERVICE_INFO" | jq -r '.status')
        
        # Print status
        printf "\r⏳ Elapsed: %3d seconds | Running: %d/%d | Status: %s" $elapsed $running_count $desired_count "$status"
        
        # Check if tasks are running
        if [ "$running_count" -ge "$desired_count" ] && [ "$running_count" -gt 0 ]; then
            echo ""
            print_success "Task(s) started successfully!"
            return 0
        fi
        
        # Wait before checking again
        sleep $CHECK_INTERVAL
        elapsed=$((elapsed + CHECK_INTERVAL))
    done
    
    echo ""
    print_warning "Timed out waiting for tasks to start"
    print_info "Tasks may still be starting. Check status manually:"
    print_info "aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
    return 1
}

# Check service details
check_service_details() {
    print_header "Step 4: Service Details"
    
    SERVICE_INFO=$(aws ecs describe-services \
        --cluster $CLUSTER \
        --services $SERVICE \
        --region $REGION \
        --query 'services[0]' \
        --output json)
    
    running_count=$(echo "$SERVICE_INFO" | jq '.runningCount')
    desired_count=$(echo "$SERVICE_INFO" | jq '.desiredCount')
    status=$(echo "$SERVICE_INFO" | jq -r '.status')
    task_def=$(echo "$SERVICE_INFO" | jq -r '.taskDefinition' | sed 's/.*://' | awk -F: '{print $1}')
    
    echo ""
    echo "Service Status:"
    echo "  Status: $status"
    echo "  Desired Count: $desired_count"
    echo "  Running Count: $running_count"
    echo "  Task Definition: $task_def"
    echo ""
    
    if [ "$running_count" -eq "$desired_count" ] && [ "$running_count" -gt 0 ]; then
        print_success "Service is healthy!"
    else
        print_warning "Service not fully healthy yet"
    fi
}

# Show recent events
show_recent_events() {
    print_header "Step 5: Recent Service Events"
    
    SERVICE_INFO=$(aws ecs describe-services \
        --cluster $CLUSTER \
        --services $SERVICE \
        --region $REGION \
        --query 'services[0].events[0:5]' \
        --output json)
    
    echo "$SERVICE_INFO" | jq -r '.[] | "  📌 \(.createdAt): \(.message)"'
    echo ""
}

# Show logs
show_logs() {
    print_header "Step 6: CloudWatch Logs (Last 10 minutes)"
    
    # Get logs from the last 10 minutes
    START_TIME=$(($(date +%s000) - 600000))
    
    # Check if there are any log events
    LOG_EVENTS=$(aws logs filter-log-events \
        --log-group-name "$LOG_GROUP" \
        --start-time $START_TIME \
        --region $REGION \
        --query 'events[0:20]' \
        --output json 2>/dev/null || echo "[]")
    
    if [ "$(echo "$LOG_EVENTS" | jq 'length')" -eq 0 ]; then
        print_info "No logs yet (task may still be starting)"
    else
        echo "Recent logs:"
        echo "$LOG_EVENTS" | jq -r '.[] | "  \(.timestamp | todate | gsub("T"; " ") | gsub("Z"; "")): \(.message)"'
    fi
    echo ""
}

# Print summary
print_summary() {
    print_header "Deployment Summary"
    
    SERVICE_INFO=$(aws ecs describe-services \
        --cluster $CLUSTER \
        --services $SERVICE \
        --region $REGION \
        --query 'services[0]' \
        --output json)
    
    running_count=$(echo "$SERVICE_INFO" | jq '.runningCount')
    desired_count=$(echo "$SERVICE_INFO" | jq '.desiredCount')
    
    echo ""
    echo "✅ CloudWatch log group created: $LOG_GROUP"
    echo "✅ Retention policy set: $RETENTION_DAYS days"
    echo ""
    echo "📊 Current Service Status:"
    echo "   Running: $running_count/$desired_count tasks"
    echo "   Cluster: $CLUSTER"
    echo "   Service: $SERVICE"
    echo "   Region: $REGION"
    echo ""
    
    if [ "$running_count" -eq "$desired_count" ] && [ "$running_count" -gt 0 ]; then
        print_success "Deployment successful!"
        echo ""
        echo "🔗 View Service:"
        echo "   https://console.aws.amazon.com/ecs/v2/clusters/$CLUSTER/services/$SERVICE"
        echo ""
        echo "📋 View Logs:"
        echo "   aws logs tail $LOG_GROUP --follow"
        echo ""
        echo "🔍 Check Task Status:"
        echo "   aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION"
    else
        print_warning "Deployment still in progress"
        echo ""
        echo "📝 Keep monitoring:"
        echo "   aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
        echo ""
        echo "📋 Check logs:"
        echo "   aws logs tail $LOG_GROUP --follow"
    fi
    echo ""
}

# Main execution
main() {
    print_header "🚀 ECS Deployment Fix - CloudWatch Setup"
    echo ""
    
    print_info "Configuration:"
    print_info "  Log Group: $LOG_GROUP"
    print_info "  Region: $REGION"
    print_info "  Cluster: $CLUSTER"
    print_info "  Service: $SERVICE"
    echo ""
    
    # Run checks
    check_aws_cli
    check_aws_credentials
    echo ""
    
    # Run deployment steps
    create_log_group
    echo ""
    
    set_retention_policy
    echo ""
    
    wait_for_tasks
    echo ""
    
    check_service_details
    show_recent_events
    show_logs
    
    print_summary
}

# Run main function
main
