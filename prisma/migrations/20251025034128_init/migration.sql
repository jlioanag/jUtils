-- CreateTable
CREATE TABLE "GameRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "roleId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GameRole_roleId_key" ON "GameRole"("roleId");
