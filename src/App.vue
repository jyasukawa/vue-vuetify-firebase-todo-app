<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue';
import { db } from '@/firebase/firebase.ts';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

const cards = ['Todo'];
const todoList = reactive([]);
const messageInput = ref('');

const handleSubmit = async () => {
  if (messageInput.value.trim() !== '') {
    const newMessage = { 
      message: messageInput.value, 
      timestamp: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, "tasks"), newMessage);
      todoList.unshift({ ...newMessage, id: docRef.id }); // idを含める
      messageInput.value = '';
    } catch (error) {
      console.error("Firestoreへのメッセージ保存に失敗しました:", error);
    }
  }
};

const handleDelete = async (id) => {
  try {
    // Firestoreから該当メッセージを削除
    await deleteDoc(doc(db, "tasks", id));

    // ローカルのメッセージリストから削除
    const index = todoList.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      todoList.splice(index, 1);
    }
  } catch (error) {
    console.error("Firestoreからのメッセージ削除に失敗しました:", error);
  }
};

const handleEdit = (item) => {
  // 編集モードに切り替え & 現在のメッセージを保存
  item.originalMessage = item.message; 
  item.isEditing = true;
};

const handleSave = async (item) => {
  try {
    const messageDoc = doc(db, "tasks", item.id);
    await updateDoc(messageDoc, { message: item.message });

    item.isEditing = false; // 編集モードを解除
    delete item.originalMessage; // 保存後にoriginalMessageを削除
  } catch (error) {
    console.error("Firestoreのメッセージ更新に失敗しました:", error);
  }
};

const handleCancelEdit = (item) => {
  // 元のメッセージを復元し、編集モードを解除
  item.message = item.originalMessage;
  delete item.originalMessage;
  item.isEditing = false;
};

const handleReset = () => {
  messageInput.value = '';
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
                          v-model="item.message"
                          label="メッセージを編集"
                          rows="1"
                          auto-grow
                        ></v-textarea>
                        <v-btn @click="handleSave(item)" color="success" small>保存</v-btn>
                        <v-btn @click="handleCancelEdit(item)" color="error" small>キャンセル</v-btn>
                      </div>
                      <div v-else class="todo-item">
                        <v-list-item-title class="message">{{ item.message }}</v-list-item-title>
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
              v-model="messageInput"
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
.message {
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
