<template>
  <li @touchstart="$emit('touchstart')" @touchend="$emit('touchend')">
    <h5>{{ note.title }}</h5>
    <p>{{ note.contentExtract }}</p>
    <slot/>
    <div class="bottom-bar">
      <span v-if="currentListSortMode == 'createDate'" class="time">{{ note.betterCreateDate() }}</span>
      <span v-if="currentListSortMode == 'updateDate'" class="time">{{ note.betterUpdateDate() }}</span>
    </div>
    <div class="right-bar van-checkbox">
      <div :class="'van-checkbox__icon van-checkbox__icon--round'+(note.checked ? ' van-checkbox__icon--checked' :'')"><i class="van-icon van-icon-success"></i></div>
      <slot name="right" />
    </div>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Note } from "../model/Note";

@Component
export default class NoteItem extends Vue {
  name = "NoteItem";

  @Prop({default:null}) note : Note;
  @Prop({default:null}) currentListSortMode : string;
}

</script>