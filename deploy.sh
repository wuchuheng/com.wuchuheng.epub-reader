#!/bin/bash

# 2. Handle logic.
# 2.1 log function
log() {
    local message="$1"
    echo -e "\e[1;32m[INFO]\e[0m $(date +'%Y-%m-%d %H:%M:%S') - ${message}"
}


# 2.1 Build project.
log "Build project"
pnpm run build

# 2.2 Sync the products to remote server through rsync.
remotePath=/opt/1panel/apps/openresty/openresty/www/sites/book.wuchuheng.com/index
remoteHostName='tc'
log "Syncing files to ${remoteHostName} (Checksum mode)..."
rsync -azc --delete --inplace -e "ssh -o Cipher=aes128-gcm@openssh.com -o Compression=no" dist/ ${remoteHostName}:${remotePath}




log "Upload completed successfully! 🎉 🎉 🎉"
