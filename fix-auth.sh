#!/bin/bash

# Fix recipe-crud.test.ts auth patterns
sed -i 's/await createAndLoginTestUser(page, '\''admin'\'');/const adminUser = await createTestUser('\''admin'\'');\n\t\ttry {\n\t\t\tawait loginUser(page, adminUser.email, adminUser.password);/g' /home/guru/other-repos/receipe-box/e2e/recipe-crud.test.ts

echo "Auth patterns updated"