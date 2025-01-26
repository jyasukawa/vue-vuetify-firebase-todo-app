<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue';
import { db } from '@/firebase/firebase.ts';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

const cards = ['Todo'];
const todoList = reactive([]);
const taskInput = ref('');

const handleSubmit = async () => {
  if (taskInput.value.trim() !== '') {
    const newTask = {
      task: taskInput.value,
      timestamp: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      todoList.unshift({ ...newTask, id: docRef.id });
      taskInput.value = '';
    } catch (error) {
      console.error("Firestoreへのメッセージ保存に失敗しました:", error);
    }
  }
};

const handleDelete = async (id) => {
  try {
    // Firestoreから該当タスクを削除
    await deleteDoc(doc(db, "tasks", id));

    // ローカルのタスクリストから削除
    const index = todoList.findIndex((tsk) => tsk.id === id);
    if (index !== -1) {
      todoList.splice(index, 1);
    }
  } catch (error) {
    console.error("Firestoreからのタスク削除に失敗しました:", error);
  }
};

const handleEdit = (item) => {
  // 編集モードに切り替え & 現在のタスクを保存
  item.originalTask = item.task; 
  item.isEditing = true;
};

const handleSave = async (item) => {
  try {
    const taskDoc = doc(db, "tasks", item.id);
    await updateDoc(taskDoc, { task: item.task });

    item.isEditing = false; // 編集モードを解除
    delete item.originalTask; // 保存後にoriginalTaskを削除
  } catch (error) {
    console.error("Firestoreのタスク更新に失敗しました:", error);
  }
};

const handleCancelEdit = (item) => {
  // 元のタスクを復元し、編集モードを解除
  item.task = item.originalTask;
  delete item.originalTask;
  item.isEditing = false;
};

const handleReset = () => {
  taskInput.value = '';
};

onMounted(async () => {
  try {
    const chatRef = collection(db, "tasks");

    // timestampで降順にソート
    const chatQuery = query(chatRef, orderBy("timestamp", "desc"));
    const snapShot = await getDocs(chatQuery);
    snapShot.forEach((doc) => {
      todoList.push({ ...doc.data(), id: doc.id }); // doc.idを含める
    });
  } catch (error) {
    console.error("Firestoreのデータ取得に失敗しました:", error);
  }
});
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-row>
          <v-col v-for="card in cards" :key="card" cols="12">
            <v-card>
              <v-list lines="two">
                <v-list-subheader>{{ card }}</v-list-subheader>

                <template v-for="(item, index) in todoList" :key="index">
                  <v-list-item>
                    <template #prepend>
                      <v-avatar color="grey-darken-1" size="24"></v-avatar>
                    </template>
                    <div class="mcon">
                      <div v-if="item.isEditing">
                        <v-textarea
                          v-model="item.task"
                          label="タスクを編集"
                          rows="1"
                          auto-grow
                        ></v-textarea>
                        <v-btn @click="handleSave(item)" color="success" small>保存</v-btn>
                        <v-btn @click="handleCancelEdit(item)" color="error" small>キャンセル</v-btn>
                      </div>
                      <div v-else class="todo-item">
                        <v-list-item-title class="task">{{ item.task }}</v-list-item-title>
                        <v-btn size="30" @click="handleEdit(item)" icon>
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn size="30" @click="handleDelete(item.id)" icon>
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-list-item>

                  <v-divider v-if="index !== todoList.length - 1" :key="`divider-${index}`" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-container class="input-container">
          <div class="input-form">
            <v-textarea
              v-model="taskInput"
              class="mx-2"
              label="タスクを追加する"
              rows="1"
              append-inner-icon="mdi-close"
              auto-grow
              @click:append-inner="handleReset"
            ></v-textarea>
            <v-btn size="55" class="submit-button" @click="handleSubmit" type="submit">送信</v-btn>
          </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.task {
	text-align: left;
}
.mcon {
  margin-left: 20px;
}
.input-container {
	margin: 0;
}
.input-form {
  display: flex;
  width: 50%;
}
.todo-item {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 40px;
}
</style>
