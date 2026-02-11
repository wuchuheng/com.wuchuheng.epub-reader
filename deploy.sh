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

# 2.2 Upload the products to remove server through sftp.
localPath=dist/
remotePath=/opt/1panel/apps/openresty/openresty/www/sites/book.wuchuheng.com/index

#2.2.1 Upload it to remote service.
log "Uploading files to ${remoteHostName}..."

remoteHostName='tc'

sftp ${remoteHostName} << EOF
put -r ${localPath}/* ${remotePath}/
exit
EOF

log "Upload completed successfully! 🎉 🎉 🎉"
