<template>
  <t-loading
    :loading="viewLoading"
    style="height: 598px; width: 100%; background: #fff"
  />
  <div
    class="home_container"
    v-if="hasLogin && !viewLoading"
    style="height: 598px"
  >
    <el-scrollbar style="padding-right: 8px">
      <div v-if="state.activeTab !== 'team'" class="relative z-20 space-y-2">
        <div class="test_body juc_b top_container">
          <div class="test_body logo_container">
            <t-image
              :src="logo"
              fit="cover"
              style="width: 120px; height: 30px"
              @dblclick="openDashboard"
            />
          </div>
          <div v-if="excessPointBalance" class="test_body">
            <div class="test_body">
              <div class="f14">当前查看次数已不足20%，请及时&nbsp;</div>
              <t-link
                theme="primary"
                hover="color"
                @click="excessPointBalanceVisible = true"
              >
                充值
              </t-link>
              <div class="f14">&nbsp;!</div>
              <t-button
                shape="square"
                variant="text"
                @click="excessPointBalance = false"
              >
                <template #icon><CloseIcon /></template>
              </t-button>
            </div>
          </div>
          <t-dropdown :min-column-width="88" @click="clickHandler">
            <div class="avatar_body test_body cur_p" style="gap: 10px">
              <t-avatar
                size="medium"
                :style="{
                  backgroundColor: getColorById(userInfoMain?.userInfo?.userId),
                }"
              >
                <span style="color: #fff">{{
                  goodlookName(userInfoMain?.userInfo?.nickName)
                }}</span>
              </t-avatar>
              <div class="avatar_name f14">
                {{ userInfoMain?.userInfo?.nickName }}
              </div>
              <ChevronDownIcon />
            </div>
            <t-dropdown-menu>
              <t-dropdown-item :value="1"> 管理后台 </t-dropdown-item>
              <t-dropdown-item :value="2"> 退出登录 </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </div>
        <!-- 自动找简历 -->
        <div
          v-show="activeType === 'autoResume'"
          class="disflex fl_dir_c bw100"
        >
          <div
            class="bw100 test_body fl_dir_c juc_c radio_container"
            style="padding: 12px 0 0px"
          >
            <t-radio-group
              variant="default-filled"
              size="medium"
              v-model="radioValue"
            >
              <t-radio-button :value="1">自动找简历</t-radio-button>
              <t-radio-button :value="2">自动找简历记录</t-radio-button>
              <!-- <t-radio-button :value="3">岗位JD优化</t-radio-button> -->
            </t-radio-group>
          </div>
          <div v-if="radioValue === 1" class="plug_container">
            <t-form
              ref="form"
              class="home-form-container"
              :rules="FORM_RULES"
              :data="formData"
              :colon="true"
            >
              <div class="Group_container" style="margin-bottom: 24px">
                <div class="test_body bw100 juc_b">
                  <div class="test_body" style="gap: 1px; padding: 0 18px">
                    <t-image
                      :src="Group1"
                      fit="cover"
                      style="width: 14px; height: 24px"
                    />
                    <div class="f16 grey0">选择职位:</div>
                  </div>
                  <div
                    class="test_body cur_p"
                    style="gap: 2px; padding-right: 18px"
                    @click="getPositionList"
                  >
                    <t-button theme="primary" shape="circle" variant="text">
                      <RefreshIcon />
                    </t-button>
                    <div class="f14 grey1 dark_blue">同步BOSS职位</div>
                  </div>
                </div>
                <t-divider style="margin: 8px 0 5px" />
                <div class="disflex fl_dir_c bw100">
                  <t-form-item label="" label-width="18px" name="position">
                    <div class="disflex fl_dir_c bw100">
                      <t-select
                        v-model="positionValue"
                        style="width: 100%; padding-right: 18px"
                        placeholder="请先同步BOSS职位"
                        :options="positionOptions"
                        @change="positionChange"
                      />
                      <div
                        v-show="isError && !positionValue"
                        class="red f12 pos_a_err"
                      >
                        职位不能为空！
                      </div>
                    </div>
                  </t-form-item>
                  <div class="test_body" style="padding: 15px 18px; gap: 2px">
                    <FilterIcon class="f18 grey1" />
                    <div class="f16 grey1">筛选条件</div>
                  </div>
                  <div
                    class="ws_b"
                    style="margin-left: 15px; padding: 0 18px 0 22px"
                  >
                    <div v-if="!isShowMore" class="disflex fl_dir_c bw100">
                      <t-form-item
                        label="年龄范围(岁)"
                        label-width="140px"
                        label-align="left"
                        name="age"
                      >
                        <div
                          style="
                            display: flex;
                            flex-direction: column;
                            width: 100%;
                          "
                        >
                          <div style="margin-bottom: 8px">
                            <div style="display: flex; align-items: center">
                              <div style="font-size: 14px; margin-right: 15px">
                                {{ ageValue[0] }}
                              </div>
                              <t-slider
                                v-model="ageValue"
                                range
                                :max="55"
                                :min="16"
                                style="width: 90%"
                                @change-end="ageChange"
                              />
                              <div style="font-size: 14px; margin-left: 15px">
                                {{ ageValue[1] }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </t-form-item>
                      <t-form-item
                        label="院校"
                        name="jobIntention"
                        label-width="140px"
                        label-align="left"
                      >
                        <div style="display: flex; flex-direction: column">
                          <div style="margin-bottom: 8px">
                            <t-check-tag-group
                              v-model="academyValue"
                              :options="academyOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              multiple
                              @change="academyChange"
                            />
                          </div>
                          <t-checkbox
                            v-if="
                              academyValue.filter((num) => num !== 0).length > 0
                            "
                            v-model="academyCheckbox"
                          >
                            只看第一学历
                          </t-checkbox>
                        </div>
                      </t-form-item>
                      <t-form-item
                        label="经验要求"
                        name="experience"
                        label-width="140px"
                        label-align="left"
                      >
                        <t-check-tag-group
                          v-model="experienceValue"
                          :options="experienceOptions"
                          :checked-props="STYLE_C_CHECKED_PROPS"
                          :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                          multiple
                          @change="experienceChange"
                        />
                      </t-form-item>
                      <t-form-item
                        label="学历要求"
                        name="educational"
                        label-width="140px"
                        label-align="left"
                      >
                        <t-check-tag-group
                          v-model="educationalValue"
                          :options="educationalOptions"
                          :checked-props="STYLE_C_CHECKED_PROPS"
                          :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                          multiple
                          @change="educationalChange"
                        />
                      </t-form-item>
                    </div>
                    <el-collapse-transition>
                      <div v-show="isShowMore" class="disflex fl_dir_c bw100">
                        <t-form-item
                          label="年龄范围(岁)"
                          label-width="140px"
                          label-align="left"
                          name="age"
                        >
                          <div
                            style="
                              display: flex;
                              flex-direction: column;
                              width: 100%;
                            "
                          >
                            <div style="margin-bottom: 8px">
                              <div style="display: flex; align-items: center">
                                <div
                                  style="font-size: 14px; margin-right: 15px"
                                >
                                  {{ ageValue[0] }}
                                </div>
                                <t-slider
                                  v-model="ageValue"
                                  range
                                  :max="55"
                                  :min="16"
                                  style="width: 90%"
                                  @change-end="ageChange"
                                />
                                <div style="font-size: 14px; margin-left: 15px">
                                  {{ ageValue[1] }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </t-form-item>
                        <div v-show="isShowMore">
                          <t-form-item
                            v-if="
                              professionOptions && professionOptions.length > 0
                            "
                            label="专业"
                            name="profession"
                            label-width="140px"
                            label-align="left"
                          >
                            <div style="display: flex; flex-direction: column">
                              <div style="margin-bottom: 8px">
                                <t-check-tag-group
                                  v-model="professionValue"
                                  :options="professionOptions"
                                  :checked-props="STYLE_C_CHECKED_PROPS"
                                  :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                                  multiple
                                  @change="professionChange"
                                />
                              </div>
                            </div>
                          </t-form-item>
                        </div>
                        <div v-show="isShowMore">
                          <t-form-item
                            label="活跃度[单选]"
                            name="vitality"
                            label-width="140px"
                            label-align="left"
                          >
                            <t-check-tag-group
                              v-model="vitalityValue"
                              :options="vitalityOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              @change="vitalityChange"
                            />
                          </t-form-item>
                        </div>
                        <div v-show="isShowMore">
                          <t-form-item
                            label="性别[单选]"
                            name="sex"
                            label-width="140px"
                            label-align="left"
                          >
                            <t-check-tag-group
                              v-model="sexValue"
                              :options="sexOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              @change="sexChange"
                            />
                          </t-form-item>
                        </div>
                        <div v-show="isShowMore">
                          <t-form-item
                            label="近期没有看过"
                            name="latelyChat"
                            label-width="140px"
                            label-align="left"
                          >
                            <t-check-tag-group
                              v-model="latelyChatValue"
                              :options="latelyChatOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              @change="latelyChatChange"
                            />
                          </t-form-item>
                        </div>
                        <div v-show="isShowMore">
                          <t-form-item
                            label="与同事交换简历"
                            name="interchange"
                            label-width="140px"
                            label-align="left"
                          >
                            <t-check-tag-group
                              v-model="interchangeValue"
                              :options="interchangeOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              @change="interchangeChange"
                            />
                          </t-form-item>
                        </div>
                        <t-form-item
                          label="院校"
                          name="jobIntention"
                          label-width="140px"
                          label-align="left"
                        >
                          <div style="display: flex; flex-direction: column">
                            <div style="margin-bottom: 8px">
                              <t-check-tag-group
                                v-model="academyValue"
                                :options="academyOptions"
                                :checked-props="STYLE_C_CHECKED_PROPS"
                                :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                                multiple
                                @change="academyChange"
                              />
                            </div>
                            <t-checkbox
                              v-if="
                                academyValue.filter((num) => num !== 0).length >
                                0
                              "
                              v-model="academyCheckbox"
                            >
                              只看第一学历
                            </t-checkbox>
                          </div>
                        </t-form-item>
                        <div v-show="isShowMore">
                          <t-form-item
                            label="跳槽频率[单选]"
                            name="vitality"
                            label-width="140px"
                            label-align="left"
                          >
                            <t-check-tag-group
                              v-model="jobHoppingValue"
                              :options="jobHoppingOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              @change="jobHoppingChange"
                            />
                          </t-form-item>
                        </div>
                        <div v-show="isShowMore">
                          <t-form-item
                            v-if="keyWordsOptions && keyWordsOptions.length > 0"
                            label="牛人关键词"
                            name="profession"
                            label-width="140px"
                            label-align="left"
                          >
                            <div style="display: flex; flex-direction: column">
                              <div style="margin-bottom: 8px">
                                <t-check-tag-group
                                  v-model="keyWordsValue"
                                  :options="keyWordsOptions"
                                  :checked-props="STYLE_C_CHECKED_PROPS"
                                  :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                                  multiple
                                  @change="keyWordsChange"
                                />
                              </div>
                            </div>
                          </t-form-item>
                        </div>
                        <t-form-item
                          label="经验要求"
                          name="experience"
                          label-width="140px"
                          label-align="left"
                        >
                          <t-check-tag-group
                            v-model="experienceValue"
                            :options="experienceOptions"
                            :checked-props="STYLE_C_CHECKED_PROPS"
                            :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                            multiple
                            @change="experienceChange"
                          />
                        </t-form-item>
                        <t-form-item
                          label="学历要求"
                          name="educational"
                          label-width="140px"
                          label-align="left"
                        >
                          <t-check-tag-group
                            v-model="educationalValue"
                            :options="educationalOptions"
                            :checked-props="STYLE_C_CHECKED_PROPS"
                            :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                            multiple
                            @change="educationalChange"
                          />
                        </t-form-item>
                        <div v-show="isShowMore">
                          <t-form-item
                            label="薪资待遇[单选]"
                            name="salary"
                            label-width="140px"
                            label-align="left"
                          >
                            <t-check-tag-group
                              v-model="salaryValue"
                              :options="salaryOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              @change="salaryChange"
                            />
                          </t-form-item>
                        </div>
                        <div v-show="isShowMore">
                          <t-form-item
                            label="求职意向"
                            name="jobIntention"
                            label-width="140px"
                            label-align="left"
                          >
                            <t-check-tag-group
                              v-model="jobIntentionValue"
                              :options="jobIntentionOptions"
                              :checked-props="STYLE_C_CHECKED_PROPS"
                              :unchecked-props="STYLE_B_UNCHECKED_PROPS"
                              multiple
                              @change="jobIntentionChange"
                            />
                          </t-form-item>
                        </div>
                      </div>
                    </el-collapse-transition>
                    <t-button
                      variant="text"
                      theme="primary"
                      style="margin-left: -24px"
                      @click="isShowMore = !isShowMore"
                    >
                      <template #icon>
                        <ChevronRightIcon class="f18" v-if="!isShowMore" />
                        <ChevronUpIcon class="f18" v-else />
                      </template>
                      更多筛选条件
                    </t-button>
                  </div>
                </div>
              </div>
              <div class="Group_container" style="margin-bottom: 24px">
                <div class="test_body" style="gap: 3px; padding: 0 18px">
                  <t-image
                    :src="Group2"
                    fit="cover"
                    style="width: 16px; height: 24px"
                  />
                  <div class="f14 grey0">简历判断标准:</div>
                </div>
                <t-divider style="margin: 8px 0 5px" />
                <t-collapse
                  v-model="panelValue1"
                  expandIconPlacement="right"
                  @change="handlePanelChange"
                >
                  <t-collapse-panel :value="1">
                    <template #expandIcon>
                      <ChevronUpIcon
                        v-if="panelValue1.length > 0"
                        class="f18"
                      />
                      <ChevronDownIcon v-else class="f18" />
                    </template>
                    <template #header>
                      <div class="test_body">
                        <div class="f14 grey1">关键词匹配</div>
                        <div class="f12 grey3">（可选）</div>
                        <t-tag
                          variant="light"
                          :theme="
                            mitAttachmentArray.length > 0
                              ? 'primary'
                              : 'default'
                          "
                          >已设置{{ mitAttachmentArray.length || 0 }}项</t-tag
                        >
                      </div>
                    </template>
                    <template #content>
                      <div class="attachment_body bw100 disflex fl_dir_c">
                        <t-tag theme="warning" variant="light"
                          >插件会在候选人的在线简历中搜索您设置的关键词,根据内容直接进行匹配,填写需慎重</t-tag
                        >
                        <div class="disflex bw100 fl_dir_c t_mt10">
                          <t-form-item
                            v-if="mitAttachmentArray.includes('recent_entry')"
                            name="recent_entry"
                            label-width="140px"
                            label-align="left"
                            style="margin-bottom: 16px"
                          >
                            <template #label>
                              <span class="posItem_r">
                                <t-button
                                  shape="square"
                                  variant="text"
                                  class="pi_close"
                                  @click="
                                    removeAttachment({
                                      content: '近期任职',
                                      value: 'recent_entry',
                                    })
                                  "
                                >
                                  <template #icon><CloseIcon /></template>
                                </t-button>
                                <span class="f14">近期任职</span>
                              </span>
                            </template>
                            <div class="test_body" style="gap: 12px">
                              <div class="f12 grey3" style="width: 125px">
                                包含职位关键词
                              </div>
                              <t-input
                                v-model="recentEntry"
                                placeholder="请输入单个职位关键词"
                                @change="recentEntryChange"
                              />
                            </div>
                          </t-form-item>
                          <t-form-item
                            v-if="mitAttachmentArray.includes('empty_period')"
                            name="empty_period"
                            label-width="140px"
                            label-align="left"
                            style="margin-bottom: 16px"
                          >
                            <template #label>
                              <span class="posItem_r">
                                <t-button
                                  shape="square"
                                  variant="text"
                                  class="pi_close"
                                  @click="
                                    removeAttachment({
                                      content: '空窗期',
                                      value: 'empty_period',
                                    })
                                  "
                                >
                                  <template #icon><CloseIcon /></template>
                                </t-button>
                                <span class="f14">空窗期</span>
                              </span>
                            </template>
                            <div class="test_body" style="gap: 12px">
                              <div class="f12 grey3" style="width: 86px">
                                最近空窗少于
                              </div>
                              <t-input-number
                                v-model="emptyPeriod"
                                theme="normal"
                                placeholder="请输入空窗期范围"
                                :min="0"
                                @change="emptyPeriodChange"
                              >
                                <template #suffix>
                                  <span>月</span>
                                </template>
                              </t-input-number>
                            </div>
                          </t-form-item>
                          <t-form-item
                            v-if="mitAttachmentArray.includes('profession')"
                            name="profession_word"
                            label-width="140px"
                            label-align="left"
                            style="margin-bottom: 16px"
                          >
                            <template #label>
                              <span class="posItem_r">
                                <t-button
                                  shape="square"
                                  variant="text"
                                  class="pi_close"
                                  @click="
                                    removeAttachment({
                                      content: '专业',
                                      value: 'profession',
                                    })
                                  "
                                >
                                  <template #icon><CloseIcon /></template>
                                </t-button>
                                <span class="f14">专业</span>
                              </span>
                            </template>
                            <div class="test_body" style="gap: 12px">
                              <div class="f12 grey3" style="width: 125px">
                                包含专业关键词
                              </div>
                              <t-input
                                v-model="professionWord"
                                placeholder="请输入单个专业关键词"
                                @change="professionWordChange"
                              />
                            </div>
                          </t-form-item>
                          <t-form-item
                            v-if="
                              mitAttachmentArray.includes('expected_position')
                            "
                            name="expected_position"
                            label-width="140px"
                            label-align="left"
                            style="margin-bottom: 16px"
                          >
                            <template #label>
                              <span class="posItem_r">
                                <t-button
                                  shape="square"
                                  variant="text"
                                  class="pi_close"
                                  @click="
                                    removeAttachment({
                                      content: '期望职位',
                                      value: 'expected_position',
                                    })
                                  "
                                >
                                  <template #icon><CloseIcon /></template>
                                </t-button>
                                <span class="f14">期望职位</span>
                              </span>
                            </template>
                            <div class="test_body" style="gap: 12px">
                              <div class="f12 grey3" style="width: 170px">
                                包含期望职位关键词
                              </div>
                              <t-input
                                v-model="expectedPosition"
                                placeholder="请输入单个期望职位关键词"
                                @change="expectedPositionChange"
                              />
                            </div>
                          </t-form-item>
                          <t-form-item
                            v-if="mitAttachmentArray.includes('company_name')"
                            name="company_name"
                            label-width="140px"
                            label-align="left"
                            style="margin-bottom: 16px"
                          >
                            <template #label>
                              <span class="posItem_r">
                                <t-button
                                  shape="square"
                                  variant="text"
                                  class="pi_close"
                                  @click="
                                    removeAttachment({
                                      content: '公司名称',
                                      value: 'company_name',
                                    })
                                  "
                                >
                                  <template #icon><CloseIcon /></template>
                                </t-button>
                                <span class="f14">公司名称</span>
                              </span>
                            </template>
                            <div class="test_body" style="gap: 12px">
                              <div class="f12 grey3" style="width: 170px">
                                包含公司名称关键词
                              </div>
                              <t-input
                                v-model="companyName"
                                placeholder="请输入单个公司名称关键词"
                                @change="companyNameChange"
                              />
                            </div>
                          </t-form-item>
                          <t-form-item
                            v-if="mitAttachmentArray.includes('resume_text')"
                            name="resume_text"
                            label-width="140px"
                            label-align="left"
                            style="margin-bottom: 16px"
                          >
                            <template #label>
                              <span class="posItem_r">
                                <t-button
                                  shape="square"
                                  variant="text"
                                  class="pi_close"
                                  @click="
                                    removeAttachment({
                                      content: '简历文本',
                                      value: 'resume_text',
                                    })
                                  "
                                >
                                  <template #icon><CloseIcon /></template>
                                </t-button>
                                <span class="f14">简历文本</span>
                              </span>
                            </template>
                            <div class="disflex fl_dir_c">
                              <div class="r_test_ul">
                                <div
                                  class="r_test_li"
                                  v-for="(item, index) in resumeTextList"
                                  :key="index"
                                >
                                  <t-input
                                    v-model="item.wordName"
                                    placeholder="请输入任意简历文本关键词"
                                    @change="resumeTextChange(item.wordName)"
                                  />
                                  <t-icon
                                    name="close"
                                    @click="removeResumeText(item)"
                                  />
                                </div>
                              </div>
                              <t-link
                                theme="primary"
                                hover="color"
                                @click="addResumeText"
                              >
                                <template #prefixIcon><AddIcon /></template>
                                添加简历文本关键词
                              </t-link>
                            </div>
                          </t-form-item>
                        </div>
                        <div
                          v-if="attachmentOptions.length > 0"
                          class="disflex fl_dir_c"
                        >
                          <t-dropdown
                            :options="attachmentOptions"
                            @click="addAttachment"
                          >
                            <t-button
                              variant="outline"
                              theme="primary"
                              class="bw100"
                              >添加附加条件</t-button
                            >
                          </t-dropdown>
                        </div>
                      </div>
                    </template>
                  </t-collapse-panel>
                </t-collapse>

                <div
                  class="disflex bw100 fl_dir_c t_mt10"
                  style="padding: 0 18px"
                >
                  <div class="test_body">
                    <div class="f14 grey1">AI智能分析</div>
                    <div class="f12 grey3">（推荐使用）</div>
                    <t-tag
                      variant="light"
                      :theme="tagList.length > 0 ? 'primary' : 'default'"
                      >已设置{{ tagList.length || 0 }}项</t-tag
                    >
                  </div>
                  <div class="f12 grey3 t_mb10">
                    Al会根据以下关键词智能分析简历,综合评估候选人与职位的匹配度
                  </div>
                  <div
                    class="test_body fl_wr"
                    style="display: flex; gap: 12px; margin-bottom: 5px"
                  >
                    <t-tooltip
                      content="为确保简历筛选更精准，建议标签数量控制在5个以内。"
                    >
                      <t-button theme="primary" size="small" @click="addTag">
                        <template #icon>
                          <AddIcon />
                        </template>
                        添加简历判断标准
                      </t-button>
                    </t-tooltip>
                  </div>
                  <div class="test_body fl_wr" style="gap: 12px">
                    <div v-for="item in tagList" :key="item.value">
                      <t-tooltip
                        :content="item.label ? item.label : '请输入判断标准'"
                      >
                        <div class="test_body" style="gap: 8px">
                          <t-input
                            v-model="item.label"
                            size="medium"
                            :autoWidth="true"
                            placeholder="请输入判断标准"
                            :autofocus="item.label === ''"
                            style="width: 240px"
                            @blur="blurItemChange(item)"
                          />
                          <DeleteIcon
                            class="cur_p"
                            @click="handleClose(item)"
                          />
                        </div>
                      </t-tooltip>
                    </div>
                  </div>
                </div>

                <div class="disflex bw100 fl_dir_c t_mt10">
                  <t-collapse
                    v-model="panelValue2"
                    expandIconPlacement="right"
                    @change="handlePanelChange"
                  >
                    <t-collapse-panel :value="1">
                      <template #expandIcon>
                        <ChevronUpIcon
                          v-if="panelValue2.length > 0"
                          class="f18"
                        />
                        <ChevronDownIcon v-else class="f18" />
                      </template>
                      <template #header>
                        <div class="test_body" style="gap: 12px">
                          <div class="f14 grey1">高级选项</div>
                          <t-tag
                            variant="light"
                            :theme="p_num > 0 ? 'primary' : 'default'"
                          >
                            已设置{{ p_num }}项
                          </t-tag>
                        </div>
                      </template>
                      <template #content>
                        <t-form-item
                          label="智能去重"
                          name="greetingMessage"
                          label-width="85px"
                          label-align="left"
                          style="margin-bottom: 16px"
                        >
                          <div
                            style="
                              display: flex;
                              flex-direction: column;
                              width: 100%;
                            "
                          >
                            <div
                              style="
                                display: flex;
                                width: 100%;
                                margin-top: 5px;
                                margin-bottom: 5px;
                              "
                            >
                              <t-switch
                                v-model="isAnalysis"
                                @change="isAnalysisChange"
                              />
                              <div style="font-size: 12px; color: #86909c">
                                （自动跳过插件已经分析过的候选人,避免重复打扰）
                              </div>
                            </div>
                          </div>
                        </t-form-item>
                        <t-form-item
                          label="深度分析"
                          name="preciseMatch"
                          label-width="85px"
                          label-align="left"
                          style="margin-bottom: 16px"
                        >
                          <div
                            style="
                              display: flex;
                              flex-direction: column;
                              width: 100%;
                            "
                          >
                            <div
                              style="
                                display: flex;
                                width: 100%;
                                margin-top: 5px;
                                margin-bottom: 5px;
                              "
                            >
                              <t-switch
                                v-model="isPreciseMatch"
                                @change="isPreciseMatchChange"
                              />
                              <div style="font-size: 12px; color: #86909c">
                                （启用高级AI模型进行深度推理分析,匹配更精准但速度会慢2-3倍）
                              </div>
                            </div>
                          </div>
                        </t-form-item>
                        <t-form-item
                          label="岗位匹配"
                          name="isExperienceMatching"
                          label-width="85px"
                          label-align="left"
                          style="margin-bottom: 16px"
                        >
                          <div
                            style="
                              display: flex;
                              flex-direction: column;
                              width: 100%;
                            "
                          >
                            <div
                              style="
                                display: flex;
                                width: 100%;
                                margin-top: 5px;
                                margin-bottom: 5px;
                              "
                            >
                              <t-switch
                                v-model="isExperienceMatching"
                                @change="isExperienceMatchingChange"
                              />
                              <div style="font-size: 12px; color: #86909c">
                                （要求候选人过往工作经历必须包含当前招聘职位,应届生建议不开启）
                              </div>
                            </div>
                          </div>
                        </t-form-item>
                      </template>
                    </t-collapse-panel>
                  </t-collapse>
                </div>
              </div>
              <div class="Group_container" style="margin-bottom: 24px">
                <div class="test_body" style="gap: 1px; padding: 0 18px">
                  <t-image
                    :src="Group3"
                    fit="cover"
                    style="width: 16px; height: 24px"
                  />
                  <div class="f16 grey0">智能沟通:</div>
                </div>
                <t-divider style="margin: 8px 0 5px" />
                <div class="ws_b" style="margin-left: 15px">
                  <div class="bw100 test_body fl_dir_c juc_c">
                    <t-radio-group
                      v-model="chatValue"
                      variant="primary-filled"
                      style="width: 100%"
                    >
                      <t-radio-button
                        :value="1"
                        class="test_body juc_c"
                        style="width: 50%"
                      >
                        自动打招呼
                      </t-radio-button>
                      <t-radio-button
                        :value="2"
                        class="test_body juc_c"
                        style="width: 50%"
                      >
                        自动回复
                      </t-radio-button>
                    </t-radio-group>
                  </div>
                  <t-form-item
                    v-show="chatValue === 1"
                    name="greetingMessage"
                    label-width="180px"
                    label-align="top"
                    style="margin-bottom: 16px; margin-top: 12px"
                  >
                    <template #label>
                      <div class="test_body" style="gap: 10px">
                        <div class="f14">要简历的招呼语</div>
                        <t-tooltip
                          content="在BOSS直聘的新牛人和推荐牛人页面,自动向符合简历判断标准的求职者打招呼"
                          placement="top-left"
                        >
                          <HelpCircleFilledIcon class="dark_blue f16" />：
                        </t-tooltip>
                        <div class="test_body">
                          <t-switch v-model="isGreetingMessage" />
                          <div style="font-size: 12px; color: #86909c">
                            （开启/关闭）
                          </div>
                        </div>
                      </div>
                    </template>
                    <div
                      class="t_mt5"
                      style="display: flex; flex-direction: column; width: 100%"
                    >
                      <t-textarea
                        v-model="greetingMessage"
                        placeholder="请输入内容"
                        :disabled="!isGreetingMessage"
                        style="width: 100%"
                        :autosize="{ minRows: 2 }"
                        @change="greetingMessageChange"
                      />
                      <div class="test_body bw100">
                        <div class="test_body t_mt10" style="gap: 0px">
                          <div class="f14">智能称呼</div>
                          <t-tooltip>
                            <template #content>
                              <div class="disflex fl_dir_c">
                                <div class="f14">智能称呼示例：</div>
                                <div class="f12">· 张三（男） → 张先生</div>
                                <div class="f12">· 李梅（女） → 李女士</div>
                                <div class="f12">· 外国名字保持原样</div>
                              </div>
                            </template>
                            <HelpCircleFilledIcon class="dark_blue f16" />：
                          </t-tooltip>
                          <div class="disflex">
                            <t-button
                              theme="default"
                              size="small"
                              @click="addGreetingMessage"
                              >{{ `{求职者}` }}</t-button
                            >
                          </div>
                          <div class="f14 grey3">
                            （点击可直接添加到消息模板中）
                          </div>
                        </div>
                      </div>
                    </div>
                  </t-form-item>
                  <div
                    v-show="chatValue === 2"
                    class="bw100 disflex fl_dir_c"
                    style="gap: 8px; padding-right: 10px"
                  >
                    <div class="test_body t_mt10" style="gap: 8px">
                      <div class="f14 grey1">自动回复模板</div>
                      <div class="dislfex">
                        <t-tooltip
                          content="自动回复-在BOSS直聘的新招呼页面,自动回复主动咨询的求职者,根据简历判断标准发送对应消息"
                          placement="top-left"
                        >
                          <HelpCircleFilledIcon class="dark_blue f16" />
                        </t-tooltip>
                      </div>
                    </div>
                    <div class="b_card bw100 disflex fl_dir_c">
                      <div class="test_body bw100 juc_b">
                        <div class="test_body">
                          <CheckCircleFilledIcon class="green f16 t_mr5" />
                          <div class="f14">简历通过</div>
                          <!-- <CloseCircleFilledIcon /> -->
                        </div>
                        <div class="test_body">
                          <div class="test_body" style="gap: 0px">
                            <div class="f14">智能称呼</div>
                            <t-tooltip>
                              <template #content>
                                <div class="disflex fl_dir_c">
                                  <div class="f14">智能称呼示例：</div>
                                  <div class="f12">· 张三（男） → 张先生</div>
                                  <div class="f12">· 李梅（女） → 李女士</div>
                                  <div class="f12">· 外国名字保持原样</div>
                                </div>
                              </template>
                              <HelpCircleFilledIcon class="dark_blue f16" />：
                            </t-tooltip>
                            <div class="disflex">
                              <t-button
                                theme="default"
                                size="small"
                                @click="addAutoReplySuccessMessage"
                                >{{ `{求职者}` }}</t-button
                              >
                            </div>
                            <div class="f14 grey3">
                              （点击可直接添加到消息模板中）
                            </div>
                          </div>
                        </div>
                      </div>
                      <t-textarea
                        v-model="autoReplySuccessMessage"
                        placeholder="请输入判断合适后回复内容"
                        :disabled="!isAutoReply"
                        style="width: 100%; margin-top: 10px"
                        :autosize="{ minRows: 2 }"
                        @change="autoReplySuccessMessageChange"
                      />
                    </div>
                    <div class="b_card bw100 disflex fl_dir_c">
                      <div class="test_body bw100 juc_b">
                        <div class="test_body">
                          <CloseCircleFilledIcon class="red f16 t_mr5" />
                          <div class="f14">简历未通过</div>
                        </div>
                        <div class="test_body">
                          <div class="test_body" style="gap: 0px">
                            <div class="f14">智能称呼</div>
                            <t-tooltip>
                              <template #content>
                                <div class="disflex fl_dir_c">
                                  <div class="f14">智能称呼示例：</div>
                                  <div class="f12">· 张三（男） → 张先生</div>
                                  <div class="f12">· 李梅（女） → 李女士</div>
                                  <div class="f12">· 外国名字保持原样</div>
                                </div>
                              </template>
                              <HelpCircleFilledIcon class="dark_blue f16" />：
                            </t-tooltip>
                            <div class="disflex">
                              <t-button
                                theme="default"
                                size="small"
                                @click="addAutoReplyFailMessage"
                                >{{ `{求职者}` }}</t-button
                              >
                            </div>
                            <div class="f14 grey3">
                              （点击可直接添加到消息模板中）
                            </div>
                          </div>
                        </div>
                      </div>
                      <t-textarea
                        v-model="autoReplyFailMessage"
                        placeholder="请输入判断不合适后回复内容"
                        :disabled="!isAutoReply"
                        style="width: 100%; margin-top: 10px"
                        :autosize="{ minRows: 2 }"
                        @change="autoReplyFailMessageChange"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="Group_container" style="margin-bottom: 24px">
                <div class="disflex fl_dir_c" style="margin-bottom: 12px">
                  <div class="test_body" style="gap: 1px; padding: 0 18px">
                    <t-image
                      :src="Group11"
                      fit="cover"
                      style="width: 16px; height: 24px"
                    />
                    <div class="f16 grey0">运行设置:</div>
                  </div>
                  <t-divider style="margin: 8px 0 5px" />
                </div>
                <div class="ws_b" style="margin-left: 15px">
                  <div class="f14 grey1" style="width: 188px">打招呼次数</div>
                  <div
                    class="test_body"
                    style="margin-top: 24px; margin-bottom: 24px"
                  >
                    <div
                      class="test_body juc_b bw100"
                      style="gap: 12px; padding-right: 18px"
                    >
                      <div class="disflex fl_dir_c posItem_r">
                        <t-checkbox
                          v-model="recommendChecked"
                          @change="onRecommendChange"
                        >
                          <div class="test_body">
                            <div class="f14" style="width: 65px">推荐牛人</div>
                            <t-input-number
                              v-model="recommendNum"
                              theme="normal"
                              :min="0"
                              class="t_mr5 t_ml5"
                              style="width: 60px"
                              @change="recommendNumChange"
                            ></t-input-number>
                            <div class="f14">次</div>
                          </div>
                        </t-checkbox>
                        <div
                          v-show="isError && recommendChecked && !recommendNum"
                          class="red f12 pos_a_err"
                        >
                          打招呼次数不能为空或为0！
                        </div>
                      </div>
                      <div class="disflex fl_dir_c posItem_r">
                        <t-checkbox
                          v-model="newTypeChecked"
                          @change="onNewTypeChange"
                        >
                          <div class="test_body">
                            <div class="f14" style="width: 45px">新牛人</div>
                            <t-input-number
                              v-model="newTypeNum"
                              theme="normal"
                              :min="0"
                              class="t_mr5 t_ml5"
                              style="width: 60px"
                              @change="newTypeNumChange"
                            ></t-input-number>
                            <div class="f14">次</div>
                          </div>
                        </t-checkbox>
                        <div
                          v-show="isError && newTypeChecked && !newTypeNum"
                          class="red f12 pos_a_err"
                        >
                          打招呼次数不能为空或为0！
                        </div>
                      </div>
                      <div class="disflex fl_dir_c posItem_r">
                        <t-checkbox
                          v-model="isAutoReply"
                          @change="isAutoReplyChange"
                        >
                          <div class="test_body">
                            <div class="f14" style="width: 60px">自动回复</div>
                            <div class="f14 grey3">不限次</div>
                          </div>
                        </t-checkbox>
                      </div>
                    </div>
                  </div>
                  <t-form-item
                    label="开启夜间保护"
                    name="isProtection"
                    label-width="140px"
                    label-align="left"
                    style="margin-bottom: 16px"
                  >
                    <div
                      style="display: flex; flex-direction: column; width: 100%"
                    >
                      <div
                        style="
                          display: flex;
                          width: 100%;
                          margin-top: 5px;
                          margin-bottom: 5px;
                        "
                      >
                        <t-switch
                          v-model="isProtection"
                          @change="isProtectionChange"
                        />
                        <div style="font-size: 12px; color: #86909c">
                          （开启后，将在凌晨0点-6点自动停止打招呼，降低被BOSS识别为插件的风险）
                        </div>
                      </div>
                    </div>
                  </t-form-item>
                </div>
              </div>

              <t-form-item
                label-width="140px"
                label-align="left"
                style="margin-top: 30px"
              >
                <div class="test_body juc_b bw100">
                  <div />
                  <t-space size="small">
                    <t-button
                      theme="default"
                      variant="base"
                      @click="stopFlowMain"
                      >停止</t-button
                    >
                    <t-button
                      theme="primary"
                      style="margin-right: 20px"
                      @click="startResume"
                      >启动</t-button
                    >
                  </t-space>
                </div>
              </t-form-item>
            </t-form>
          </div>
          <div v-if="radioValue === 2">
            <CurriculumVitaeTable />
          </div>
          <div class="t_mt15" v-show="radioValue === 3">
            <JDHome ref="jdHomeRef" @startJD="startJD" />
          </div>
          <div style="height: 24px"></div>
        </div>
        <!-- 后台管理 -->
        <div
          v-show="activeType === 'managementBackend'"
          class="disflex fl_dir_c bw100"
        >
          <ManagementBackend @backHome="backHome" />
        </div>
      </div>
    </el-scrollbar>
    <t-dialog
      v-model:visible="excessPointBalanceVisible"
      header="请添加客服微信进行充值"
      :footer="null"
      :dialogStyle="{
        boxShadow: '0px 1px 10.4px 0px #00000029',
      }"
      :showOverlay="false"
      @close="excessPointBalanceVisible = false"
    >
      <div class="bw100 test_body juc_c fl_dir_c t_mt20 t_mb20">
        <t-image
          :src="ViewChat"
          fit="cover"
          style="width: 200px; height: 200px; margin-bottom: 12px"
        />
      </div>
    </t-dialog>
  </div>
  <div class="bg_login" v-if="!hasLogin && !viewLoading" style="height: 598px">
    <Login @loginSuccess="loginSuccess" />
  </div>
</template>
<script setup>
import {
  computed,
  onMounted,
  shallowReactive,
  watch,
  ref,
  reactive,
} from 'vue';
import browser from 'webextension-polyfill';
import {
  ChevronDownIcon,
  CloseIcon,
  AddIcon,
  FilterIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DeleteIcon,
  HelpCircleFilledIcon,
  CheckCircleFilledIcon,
  CloseCircleFilledIcon,
} from 'tdesign-icons-vue-next';
import { useUserStore } from '@/stores/user';
import { useFolderStore } from '@/stores/folder';
import { sendMessage } from '@/utils/message';
import { useWorkflowStore } from '@/stores/workflow';
import { useGroupTooltip } from '@/composable/groupTooltip';
import { useTeamWorkflowStore } from '@/stores/teamWorkflow';
import { useHostedWorkflowStore } from '@/stores/hostedWorkflow';
import { parseJSON, arraySorter } from '@/utils/helper';
import automa from '@business';
import BackgroundUtils from '@/background/BackgroundUtils';
import { RefreshIcon } from 'tdesign-icons-vue-next';
import { v4 as uuidv4 } from 'uuid';
import Login from './Login.vue';
import CurriculumVitaeTable from './curriculum-vitae-table.vue';
import ManagementBackend from './management-backend.vue';
import logo from '../../assets/images/logo_2.png';
import Group1 from '../../assets/images/Group_num_1.png';
import Group2 from '../../assets/images/Group_num_2.png';
import Group3 from '../../assets/images/Group_num_3.png';
import Group11 from '../../assets/images/Group_num_4.png';
import ViewChat from '../../assets/images/view_chat.png';
import { goodlookName, getColorById } from '../../utils/utils.js';
import JDHome from './JD-home.vue';
import { MessagePlugin } from 'tdesign-vue-next';

const isMV2 = browser.runtime.getManifest().manifest_version === 2;

const userStore = useUserStore();
const folderStore = useFolderStore();
const workflowStore = useWorkflowStore();
const teamWorkflowStore = useTeamWorkflowStore();
const hostedWorkflowStore = useHostedWorkflowStore();
const radioValue = ref(1);
const jdHomeRef = ref(null);

const viewLoading = ref(true);
const activeType = ref('autoResume');
const academyCheckbox = ref(false);

const isLoading = ref(false);

const isShowMore = ref(false);

const panelValue1 = ref([]);
const panelValue2 = ref([]);

const tagList = ref([]);

const chatValue = ref(1);
const chatSelectVal1 = ref(false);

const addTag = () => {
  const arr = tagList.value;
  const noDataItem = arr.find((item) => item.label === '');
  if (noDataItem) {
    MessagePlugin.error('有未填写的简历标签');
    return;
  }
  tagList.value.push({
    label: '',
    value: '',
    type: 1,
  });
};

const handleClose = async (item) => {
  tagList.value = tagList.value.filter((b) => b.value !== item.value);
  await browser.storage.local.set({
    tagList: tagList.value,
  });
};

const blurItemChange = async (item) => {
  if (item.label) {
    item.value = item.label;
    await browser.storage.local.set({
      tagList: tagList.value,
    });
  }
};

watch(
  () => tagList.value,
  async () => {
    await browser.storage.local.set({
      tagList: tagList.value,
    });
  },
  { deep: true }
);

const isAutoReply = ref(true);
const isAutoReplyChange = async () => {
  await browser.storage.local.set({
    isAutoReply: isAutoReply.value,
  });
};
const autoReplySuccessMessage = ref(
  '你好,{求职者},我想了解一下你的基本情况和工作经历,可以发一下你的简历吗?'
);
const autoReplySuccessMessageChange = async () => {
  await browser.storage.local.set({
    autoReplySuccessMessage: autoReplySuccessMessage.value,
  });
};
const autoReplyFailMessage = ref(
  '你好,{求职者},感谢你的关注,但与本岗位要求不太匹配,祝你求职顺利!'
);
const autoReplyFailMessageChange = async () => {
  await browser.storage.local.set({
    autoReplyFailMessage: autoReplyFailMessage.value,
  });
};

const attachmentOptions = ref([
  { content: '近期入职', value: 'recent_entry' },
  { content: '空窗期', value: 'empty_period' },
  { content: '专业', value: 'profession' },
  { content: '期望职位', value: 'expected_position' },
  { content: '公司名称', value: 'company_name' },
  { content: '简历文本', value: 'resume_text' },
]);

const mitAttachmentArray = ref([]);

const addAttachment = async (val) => {
  mitAttachmentArray.value.push(val.value);
  attachmentOptions.value = attachmentOptions.value.filter(
    (item) => item.value !== val.value
  );
  await browser.storage.local.set({
    attachmentOptions: attachmentOptions.value,
  });
  await browser.storage.local.set({
    mitAttachmentArray: mitAttachmentArray.value,
  });
};

const recentEntry = ref('');
const recentEntryChange = async () => {
  await browser.storage.local.set({
    recentEntry: recentEntry.value,
  });
};

const emptyPeriod = ref(6);
const emptyPeriodChange = async () => {
  await browser.storage.local.set({
    emptyPeriod: emptyPeriod.value,
  });
};

const professionWord = ref('');
const professionWordChange = async () => {
  await browser.storage.local.set({
    professionWord: professionWord.value,
  });
};

const expectedPosition = ref('');
const expectedPositionChange = async () => {
  await browser.storage.local.set({
    expectedPosition: expectedPosition.value,
  });
};

const companyName = ref('');
const companyNameChange = async () => {
  await browser.storage.local.set({
    companyName: companyName.value,
  });
};

const resumeTextList = ref([{ wordName: '' }]);
const addResumeText = () => {
  resumeTextList.value.push({ wordName: '' });
};
const removeResumeText = (val) => {
  resumeTextList.value = resumeTextList.value.filter(
    (item) => item.wordName !== val.wordName
  );
};
const resumeTextChange = async () => {
  debugger;
  console.log(resumeTextList.value);

  await browser.storage.local.set({
    resumeTextList: resumeTextList.value,
  });
};

const removeAttachment = async (obj) => {
  mitAttachmentArray.value = mitAttachmentArray.value.filter(
    (item) => item !== obj.value
  );
  attachmentOptions.value.push({
    content: obj.content,
    value: obj.value,
  });
  if (obj.value === 'recent_entry') {
    recentEntry.value = '';
  }
  if (obj.value === 'empty_period') {
    emptyPeriod.value = 6;
  }
  if (obj.value === 'profession') {
    professionWord.value = '';
  }
  if (obj.value === 'expected_position') {
    expectedPosition.value = '';
  }
  if (obj.value === 'company_name') {
    companyName.value = '';
  }
  if (obj.value === 'resume_text') {
    resumeTextList.value = [];
  }
  await browser.storage.local.set({
    mitAttachmentArray: mitAttachmentArray.value,
    attachmentOptions: attachmentOptions.value,
    recentEntry: recentEntry.value,
    emptyPeriod: emptyPeriod.value,
    professionWord: professionWord.value,
    expectedPosition: expectedPosition.value,
    companyName: companyName.value,
    resumeTextList: resumeTextList.value,
  });
};

useGroupTooltip();

const savedSorts =
  parseJSON(localStorage.getItem('popup-workflow-sort'), {}) || {};

const recommendChecked = ref(true);
const onRecommendChange = async (val) => {
  await browser.storage.local.set({
    recommendCheckbox: val,
  });
};
const recommendNum = ref(50);
const recommendNumChange = async (val) => {
  await browser.storage.local.set({
    recommendNum: val,
  });
};

const newTypeChecked = ref(true);
const onNewTypeChange = async (val) => {
  await browser.storage.local.set({
    newTypeCheckbox: val,
  });
};
const newTypeNum = ref(50);
const newTypeNumChange = async (val) => {
  await browser.storage.local.set({
    newTypeNum: val,
  });
};

const STYLE_B_UNCHECKED_PROPS = {
  theme: 'default',
  variant: 'dark',
};

const STYLE_C_CHECKED_PROPS = {
  theme: 'warning',
  variant: 'light',
};

const sortState = shallowReactive({
  by: savedSorts.sortBy || 'createdAt',
  order: savedSorts.sortOrder || 'desc',
});
const state = shallowReactive({
  query: '',
  teams: [],
  cardHeight: 255,
  retrieved: false,
  haveAccess: true,
  activeTab: 'local',
  pinnedWorkflows: [],
  activeFolder: savedSorts.activeFolder,
  showSettingsPopup: isMV2
    ? false
    : parseJSON(localStorage.getItem('settingsPopup'), true) ?? true,
});

const hostedWorkflows = computed(() => {
  if (state.activeTab !== 'host') return [];

  return hostedWorkflowStore.toArray.filter((workflow) =>
    workflow.name.toLocaleLowerCase().includes(state.query.toLocaleLowerCase())
  );
});
const localWorkflows = computed(() => {
  if (state.activeTab !== 'local') return [];

  const filteredLocalWorkflows = workflowStore.getWorkflows.filter(
    ({ name, folderId }) => {
      const isInFoloder =
        !state.activeFolder || state.activeFolder === folderId;
      const nameMatch = name
        .toLocaleLowerCase()
        .includes(state.query.toLocaleLowerCase());

      return isInFoloder && nameMatch;
    }
  );

  return arraySorter({
    key: sortState.by,
    order: sortState.order,
    data: filteredLocalWorkflows,
  });
});
const workflows = computed(() =>
  state.activeTab === 'local' ? localWorkflows.value : hostedWorkflows.value
);
const showTab = computed(
  () =>
    hostedWorkflowStore.toArray.length > 0 || userStore.user?.teams?.length > 0
);

async function executeWorkflow(workflow) {
  try {
    const [tab] = await browser.tabs.query({
      url: browser.runtime.getURL('/newtab.html'),
    });
    if (tab && !isMV2) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'workflow:execute',
        data: {
          data: workflow,
          options: workflow?.options,
        },
      });
    } else {
      await sendMessage('workflow:execute', workflow, 'background');
    }

    window.close();
  } catch (error) {
    console.error(error);
  }
}

function openDashboard(url) {
  BackgroundUtils.openDashboard(url);
}

watch(
  () => [sortState.by, sortState.order, state.activeFolder],
  ([sortBy, sortOrder, activeFolder]) => {
    localStorage.setItem(
      'popup-workflow-sort',
      JSON.stringify({ sortOrder, sortBy, activeFolder })
    );
  }
);

/** ***** 表单提交 ***** */
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };

const formData = reactive({
  name: '',
  tel: '',
  gender: '',
  course: [],
  status: false,
});
const form = ref(null);

const getFormattedYear = (year) => {
  return year % 100; // 取年份的后两位
};

const currentYear = new Date().getFullYear(); // 获取当前年份
const lastYear = currentYear - 1; // 计算去年

const greetNum = ref(100);
const greetNumChange = async () => {
  await browser.storage.local.set({
    greetNum: greetNum.value,
  });
};

const ageValue = ref([16, 55]);
const ageChange = async () => {
  await browser.storage.local.set({
    ageMinValue: ageValue.value[0],
    ageMaxValue: ageValue.value[1],
  });
};

const positionOptions = ref([]);
const positionAllOptions = ref([]);
const positionValue = ref(null);

const professionOptions = ref([]);
const professionValue = ref([1]);
const keyWordsOptions = ref([]);
const keyWordsValue = ref([]);

const professionChange = async (value, event) => {
  for (let i = 0; i < professionValue.value.length; i += 1) {
    if (professionValue.value[i] === 0) {
      if (event.value !== 0) {
        professionValue.value.splice(i, 1);
      } else {
        professionValue.value = [0];
      }
      break;
    }
  }
  await browser.storage.local.set({
    professionValue: professionValue.value,
  });
};

const vitalityOptions = [
  { label: '不限', value: 0 },
  { label: '刚刚活跃', value: 1 },
  { label: '今日活跃', value: 2 },
  { label: '3日内活跃', value: 3 },
  { label: '本周活跃', value: 4 },
  { label: '本月活跃', value: 5 },
];
const vitalityValue = ref([4]);

const vitalityChange = async () => {
  await browser.storage.local.set({ vitalityValue: vitalityValue.value });
};

const sexOptions = [
  { label: '不限', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
];
const sexValue = ref([0]);
const sexChange = async () => {
  await browser.storage.local.set({ sexValue: sexValue.value });
};

const latelyChatOptions = [
  { label: '不限', value: 0 },
  { label: '近14天没有', value: 1 },
];
const latelyChatValue = ref([1]);
const latelyChatChange = async () => {
  await browser.storage.local.set({ latelyChatValue: latelyChatValue.value });
};

const interchangeOptions = [
  { label: '不限', value: 0 },
  { label: '近一个月没有', value: 1 },
];
const interchangeValue = ref([1]);
const interchangeChange = async () => {
  await browser.storage.local.set({ interchangeValue: interchangeValue.value });
};

const jobHoppingOptions = [
  { label: '不限', value: 0 },
  { label: '5年少于三份', value: 1 },
  { label: '平均每份工作大于1年', value: 2 },
];
const jobHoppingValue = ref([2]);
const jobHoppingChange = async () => {
  await browser.storage.local.set({ jobHoppingValue: jobHoppingValue.value });
};

const keyWordsChange = async (value, event) => {
  for (let i = 0; i < keyWordsValue.value.length; i += 1) {
    if (keyWordsValue.value[i] === 0) {
      if (event.value !== 0) {
        keyWordsValue.value.splice(i, 1);
      } else {
        keyWordsValue.value = [0];
      }
      break;
    }
  }
  await browser.storage.local.set({
    keyWordsValue: keyWordsValue.value,
  });
};

const salaryOptions = [
  { label: '不限', value: 0 },
  { label: '3K以下', value: 1 },
  { label: '3-5K', value: 2 },
  { label: '5-10K', value: 3 },
  { label: '10-20K', value: 4 },
  { label: '20-50K', value: 5 },
  { label: '50K以上', value: 6 },
];

const salaryValue = ref([1]);

const salaryChange = async () => {
  await browser.storage.local.set({ salaryValue: salaryValue.value });
};

const jobIntentionOptions = [
  { label: '不限', value: 0 },
  { label: '离职-随时到岗', value: 1 },
  { label: '在职-暂不考虑', value: 2 },
  { label: '在职-考虑机会', value: 3 },
  { label: '在职-月内到岗', value: 4 },
];

const jobIntentionValue = ref([1]);

const jobIntentionChange = async (value, event) => {
  for (let i = 0; i < jobIntentionValue.value.length; i += 1) {
    if (jobIntentionValue.value[i] === 0) {
      if (event.value !== 0) {
        jobIntentionValue.value.splice(i, 1);
      } else {
        jobIntentionValue.value = [0];
      }
      break;
    }
  }
  await browser.storage.local.set({
    jobIntentionValue: jobIntentionValue.value,
  });
};

const resumeEvaluationCriteria = ref('简历没有明显问题');

const resumeEvaluationCriteriaChange = async () => {
  await browser.storage.local.set({
    resumeEvaluationCriteria: resumeEvaluationCriteria.value,
  });
};

const greetingMessage = ref(
  '你好，{求职者}，我想了解一下你的基本情况和工作经历，可以发一下你的简历吗？'
);

const addGreetingMessage = async () => {
  greetingMessage.value += '{求职者}';
  await browser.storage.local.set({
    greetingMessage: greetingMessage.value,
  });
};

const addAutoReplySuccessMessage = async () => {
  autoReplySuccessMessage.value += '{求职者}';
  await browser.storage.local.set({
    autoReplySuccessMessage: autoReplySuccessMessage.value,
  });
};

const addAutoReplyFailMessage = async () => {
  autoReplyFailMessage.value += '{求职者}';
  await browser.storage.local.set({
    autoReplyFailMessage: autoReplyFailMessage.value,
  });
};

const isGreetingMessage = ref(true);
const isAnalysis = ref(true); // 是否过滤已分析简历
const isPreciseMatch = ref(false); // 是否精准匹配
const isAnalysisChange = async () => {
  await browser.storage.local.set({
    isAnalysis: isAnalysis.value,
  });
};
const isPreciseMatchChange = async () => {
  await browser.storage.local.set({
    isPreciseMatch: isPreciseMatch.value,
  });
};

const isExperienceMatching = ref(false);
const isExperienceMatchingChange = async () => {
  await browser.storage.local.set({
    isExperienceMatching: isExperienceMatching.value,
  });
};

const isProtection = ref(false);
const isProtectionChange = async () => {
  await browser.storage.local.set({
    isProtection: isProtection.value,
  });
};
const greetingMessageChange = async () => {
  await browser.storage.local.set({
    greetingMessage: greetingMessage.value,
  });
};

const responseEvaluationCriteria = ref('候选人已经回复，并且回答符合逻辑');

const token = ref('');
const clientId = ref('');
const useNum = ref(0);

const isError = ref(false);
const greetNumALL = async () => {
  const num1 = recommendChecked.value ? recommendNum.value : 0;
  const num2 = newTypeChecked.value ? newTypeNum.value : 0;
  if (!positionValue.value) {
    isError.value = true;
    return false;
  }
  if (recommendChecked.value) {
    if (recommendNum.value <= 0 || !recommendNum.value) {
      isError.value = true;
      return false;
    }
  } else {
    recommendNum.value = 0;
    await browser.storage.local.set({
      recommendNum: recommendNum.value,
    });
  }
  if (newTypeChecked.value) {
    if (newTypeNum.value <= 0 || !newTypeNum.value) {
      isError.value = true;
      return false;
    }
  } else {
    newTypeNum.value = 0;
    await browser.storage.local.set({
      newTypeNum: newTypeNum.value,
    });
  }
  greetNum.value = num1 + num2;
  return true;
};

// 获取岗位需求列表（自己的）
const postPositionRequirementList = async (id, filterConditions) => {
  const saveFilterObj = {
    id,
    filterConditions: JSON.stringify(filterConditions),
  };
  const requestOptions = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
    body: JSON.stringify(saveFilterObj),
  };
  try {
    const response = await fetch(
      `/api/v1/business/recruitment/filter-conditions`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求出错：', error);
    return error;
  }
};

const startResume = async () => {
  const academyValueJoin = [];
  academyValue.value.forEach((item) => {
    academyOptions.forEach((item2) => {
      if (item2.value === item && item !== 0) {
        academyValueJoin.push(item2.label);
      }
    });
  });
  let academyValueJoinStr = null;
  if (academyValueJoin.length > 0) {
    academyValueJoinStr = academyValueJoin.join('，');
  }
  const educationalValueJoin = [];
  educationalValue.value.forEach((item) => {
    educationalOptions.forEach((item2) => {
      if (item2.value === item && item !== 0) {
        educationalValueJoin.push(item2.label);
      }
    });
  });
  let educationalValueJoinStr = null;
  if (educationalValueJoin.length > 0) {
    educationalValueJoinStr = educationalValueJoin.join('，');
  }
  const isNoErr = greetNumALL();
  if (isNoErr) {
    for (const element of workflows.value) {
      if (element.name === 'ITA 简历助手') {
        element.globalData = {
          professionValue:
            professionOptions.value && professionOptions.value.length > 0
              ? professionValue.value
              : [],
          ageMinValue: ageValue.value[0],
          ageMaxValue: ageValue.value[1],
          vitalityValue: vitalityValue.value,
          sexValue: sexValue.value,
          latelyChatValue: latelyChatValue.value,
          interchangeValue: interchangeValue.value,
          academyValue: academyValue.value,
          jobHoppingValue: jobHoppingValue.value,
          keyWordsValue:
            keyWordsOptions.value && keyWordsOptions.value.length > 0
              ? keyWordsValue.value
              : [],
          experienceValue: experienceValue.value,
          educationalValue: educationalValue.value,
          salaryValue: salaryValue.value,
          jobIntentionValue: jobIntentionValue.value,
          resumeEvaluationCriteria:
            tagList.value
              .filter((item) => item.type === 1)
              .map((item) => item.label)
              .join('，') || '候选人已经回复，并且回答符合逻辑',
          greetingMessage: isGreetingMessage.value
            ? greetingMessage.value || null
            : null,
          responseEvaluationCriteria:
            responseEvaluationCriteria.value ||
            '候选人已经回复，并且回答符合逻辑',
          positionValue: positionValue.value
            ? positionValue.value.replace(/ /g, '  ').replace(' _ ', '_')
            : null,
          positionValue_word: positionValue.value
            ? positionValue.value.split(' ')[0]
            : null,
          positionValue_all_word: positionValue.value,
          token: token.value,
          clientId: clientId.value,
          greetNum: greetNum.value,
          recommendNum: recommendChecked.value ? recommendNum.value : 0,
          newTypeNum: newTypeChecked.value ? newTypeNum.value : 0,
          isReply: true,
          useNum: useNum.value,
          isAnalysis: isAnalysis.value,
          isPreciseMatch: isPreciseMatch.value,
          isExperienceMatching: isExperienceMatching.value,
          isProtection: isProtection.value,
          recentEntry: recentEntry.value,
          emptyPeriod: mitAttachmentArray.value.includes('empty_period')
            ? emptyPeriod.value
            : 0,
          professionWord: professionWord.value,
          expectedPosition: expectedPosition.value,
          companyName: companyName.value,
          resumeTextList: resumeTextList.value,
          isAutoReply: isAutoReply.value,
          autoReplySuccessMessage: isAutoReply.value
            ? autoReplySuccessMessage.value
            : null,
          autoReplyFailMessage: isAutoReply.value
            ? autoReplyFailMessage.value
            : null,
          academyCheckbox: academyCheckbox.value,
          tagList: tagList.value,
        };
        const JD_obj = positionOptions.value.find(
          (item) => item.label === positionValue.value
        );
        if (JD_obj?.jobDescription) {
          await postPositionRequirementList(
            JD_obj.positionId,
            element.globalData
          );
        }
        executeWorkflow(element);
      }
    }
  }
};

const getPositionList = async () => {
  positionValue.value = null;
  for (const element of workflows.value) {
    if (element.name === '获取岗位列表') {
      const uuid = uuidv4();
      await browser.storage.local.set({
        uuid,
      });
      element.globalData = `{"uuid": "${uuid}"}`;
      executeWorkflow(element, true);
    }
  }
};

const stopFlow = async () => {
  for (const element of workflows.value) {
    if (element.name === '停止所有工作流') {
      const uuid = uuidv4();
      await browser.storage.local.set({
        uuid,
      });
      element.globalData = `{"uuid": "${uuid}"}`;
      executeWorkflow(element, true);
    }
  }
};

const hasLogin = ref(false);

const userInfoMain = ref(null);

// 获取岗位需求列表（自己的）
const jdListToBeConfirmed = ref([]); // JD待确认
const jdListConfirmed = ref([]); // JD已确认
const jdListUpdate = ref([]); // JD已更新
const getPositionRequirementList = async () => {
  // if (positionOptions.value?.length > 0) {
  //   return;
  // }
  const userInfo = await browser.storage.local.get('userInfo');
  const requestOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };
  try {
    const response = await fetch(
      `https://interview-api.itasaas.com/api/v1/business/recruitment/list?createBy=${userInfo.userInfo.userId}`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const arr = data?.rows;
    // const arr = data?.rows?.filter((item) => item.jobSyncVo);
    if (arr && arr.length > 0) {
      arr.forEach((item) => {
        if (item.jobSyncVo) {
          if (!item.jobSyncVo?.jdPostName) {
            item.jobSyncVo.jdPostName = item.jobSyncVo.indexName.split(' ')[0];
          }
        }
        if (!item.jobSyncVo) {
          item.jobSyncVo = {
            indexName: item.name,
            jdPostName: item.name,
            jobDescription: '',
          };
        }
      });
      const list = arr.map((item) => {
        return {
          ...item.jobSyncVo,
        };
      });
      await jdHomeRef.value.active(list);
    }
    // positionOptions.value = arr.map((item) => ({
    //   label: item.jobSyncVo.indexName,
    //   value: item.jobSyncVo.indexName,
    //   jobDescription: item.jobSyncVo.jobDescription,
    //   filterConditions: item.filterConditions,
    //   positionId: item.positionId || null,
    // }));
    // browser.storage.local.set({ positionOptions: positionOptions.value });
    return null;
  } catch (error) {
    console.error('请求出错：', error);
    return error;
  }
};

const pointBalance = ref(null);
const excessPointBalance = ref(false);
const excessPointBalanceVisible = ref(false);
const getPointBalance = async () => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    const response = await fetch(
      'https://interview-api.itasaas.com/api/v1/point/point-balance/detail',
      requestOptions
    );
    const result = await response.json();
    if (response.status === 200) {
      pointBalance.value = result.data;
      excessPointBalance.value =
        pointBalance.value?.consume / pointBalance.value?.total > 0.8
          ? true
          : false;
    }
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};
const loginSuccess = async () => {
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  hasLogin.value = true;
  //await getPositionRequirementList();
  await getPointBalance();
  return null;
};

const logout = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };
  try {
    const response = await fetch(
      'https://interview-api.itasaas.com/auth/logout',
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    hasLogin.value = false;
    console.log('已登出');
    return null;
  } catch (error) {
    console.error('请求出错：', error);
    return error;
  }
  // await browser.storage.local.remove(['token', 'clientId']);
  // token.value = null;
  // clientId.value = null;
  // hasLogin.value = false;
};

const stopFlowMain = async () => {
  await stopFlow();
};

const w_version = workflowStore.version;
const versionMit = async () => {
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-test.json
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config.json
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-orc.json
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-orc-ceshi.json
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-v3.json
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-scroll-ceshi.json
  const API_URL =
    'https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-scroll.json';
  try {
    // 添加no-cache参数避免缓存
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      // 确保不使用缓存
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = null;
    data = await response.json();
    if (!w_version.ita_version) {
      await browser.storage.local.set({
        ita_version: data.version,
        isFirstTime: true,
      });
      await workflowStore.loadData();
    } else if (w_version.ita_version !== data.version) {
      await browser.storage.local.set({
        ita_version: data.version,
        isFirstTime: true,
      });
      await workflowStore.loadData();
    }
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    // 可以返回一个默认数据或者抛出错误
    return [];
  }
};

onMounted(async () => {
  userInfoMain.value = await browser.storage.local.get('userInfo');
  if (userInfoMain.value.userInfo) {
    hasLogin.value = true;
    viewLoading.value = false;
  } else {
    hasLogin.value = false;
    viewLoading.value = false;
  }
  await versionMit();
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  state.haveAccess = /^(https?)/.test(tab.url);

  const storage = await browser.storage.local.get('pinnedWorkflows');
  state.pinnedWorkflows = storage.pinnedWorkflows || [];

  await folderStore.load();
  await userStore.loadUser({ storage: localStorage, ttl: 1000 * 60 * 5 });
  await teamWorkflowStore.loadData();

  let activeTab = localStorage.getItem('popup-tab') || 'local';

  await automa('app');

  if (
    (activeTab === 'team' && !userStore.user?.teams) ||
    (activeTab === 'host' && hostedWorkflowStore.toArray.length < 1)
  ) {
    activeTab = 'local';
  }

  state.retrieved = true;
  state.activeTab = activeTab;

  if (state.activeFolder) {
    const folderExist = folderStore.items.some(
      (folder) => folder.id === state.activeFolder
    );
    if (!folderExist) state.activeFolder = '';
  }
  const result = await browser.storage.local.get([
    'professionValue',
    'vitalityValue',
    'sexValue',
    'latelyChatValue',
    'interchangeValue',
    'academyValue',
    'jobHoppingValue',
    'keyWordsValue',
    'experienceValue',
    'educationalValue',
    'salaryValue',
    'jobIntentionValue',
    'resumeEvaluationCriteria',
    'greetingMessage',
    'responseEvaluationCriteria',
    'positionValue',
    'positionOptions',
    'positionAllOptions',
    'professionOptions',
    'keyWordsOptions',
    'token',
    'clientId',
    'ageMinValue',
    'ageMaxValue',
    'greetNum',
    'recommendCheckbox',
    'recommendNum',
    'newTypeCheckbox',
    'newTypeNum',
    'isPreciseMatch',
    'isExperienceMatching',
    'isProtection',
    'isAnalysis',
    'mitAttachmentArray',
    'attachmentOptions',
    'recentEntry',
    'emptyPeriod',
    'professionWord',
    'expectedPosition',
    'companyName',
    'resumeTextList',
    'isAutoReply',
    'autoReplySuccessMessage',
    'autoReplyFailMessage',
    'academyCheckbox',
    'tagList',
  ]);

  try {
    greetNum.value = result.greetNum || 100;
    recommendChecked.value = result.recommendCheckbox
      ? result.recommendCheckbox === true
        ? true
        : false
      : true;
    recommendNum.value = result.recommendNum * 1 || 50;
    newTypeChecked.value = result.newTypeCheckbox
      ? result.newTypeCheckbox === true
        ? true
        : false
      : true;
    newTypeNum.value = result.newTypeNum * 1 || 50;
    professionValue.value = result.professionValue
      ? Object.values(result.professionValue)
      : [];
    vitalityValue.value = result.vitalityValue
      ? Object.values(result.vitalityValue)
      : [4];
    sexValue.value = result.sexValue ? Object.values(result.sexValue) : [0];
    latelyChatValue.value = result.latelyChatValue
      ? Object.values(result.latelyChatValue)
      : [1];
    interchangeValue.value = result.interchangeValue
      ? Object.values(result.interchangeValue)
      : [1];
    academyValue.value = result.academyValue
      ? Object.values(result.academyValue)
      : [0];
    jobHoppingValue.value = result.jobHoppingValue
      ? Object.values(result.jobHoppingValue)
      : [2];
    keyWordsValue.value = result.keyWordsValue
      ? Object.values(result.keyWordsValue)
      : [];
    experienceValue.value = result.experienceValue
      ? Object.values(result.experienceValue)
      : [];
    educationalValue.value = result.educationalValue
      ? Object.values(result.educationalValue)
      : [5];
    salaryValue.value = result.salaryValue
      ? Object.values(result.salaryValue)
      : [];
    jobIntentionValue.value = result.jobIntentionValue
      ? Object.values(result.jobIntentionValue)
      : [1];
    resumeEvaluationCriteria.value = result.resumeEvaluationCriteria || null;
    greetingMessage.value =
      result.greetingMessage ||
      '你好，{求职者}，我想了解一下你的基本情况和工作经历，可以发一下你的简历吗？';
    responseEvaluationCriteria.value =
      result.responseEvaluationCriteria || '候选人已经回复，并且回答符合逻辑';
    positionOptions.value = result.positionOptions
      ? Object.values(result.positionOptions)
      : [];
    positionValue.value = result.positionValue || null;
    positionAllOptions.value = result.positionAllOptions
      ? Object.values(result.positionAllOptions)
      : [];
    professionOptions.value = result.professionOptions
      ? Object.values(result.professionOptions)
      : [];
    keyWordsOptions.value = result.keyWordsOptions
      ? Object.values(result.keyWordsOptions)
      : [];
    ageValue.value = [result.ageMinValue || 16, result.ageMaxValue || 55];
    isExperienceMatching.value =
      result.isExperienceMatching === 'true' ||
      result.isExperienceMatching === true
        ? true
        : false;
    isProtection.value =
      result.isProtection === 'true' || result.isProtection === true
        ? true
        : false;
    mitAttachmentArray.value = result.mitAttachmentArray
      ? Object.values(result.mitAttachmentArray)
      : [];
    attachmentOptions.value = result.attachmentOptions
      ? Object.values(result.attachmentOptions)
      : [
          { content: '近期入职', value: 'recent_entry' },
          { content: '空窗期', value: 'empty_period' },
          { content: '专业', value: 'profession' },
          { content: '期望职位', value: 'expected_position' },
          { content: '公司名称', value: 'company_name' },
          { content: '简历文本', value: 'resume_text' },
        ];
    recentEntry.value = result.recentEntry || '';
    emptyPeriod.value = result.emptyPeriod || 6;
    professionWord.value = result.professionWord || '';
    expectedPosition.value = result.expectedPosition || '';
    companyName.value = result.companyName || '';
    resumeTextList.value = result.resumeTextList
      ? Object.values(result.resumeTextList)
      : [];
    tagList.value = result.tagList ? Object.values(result.tagList) : [];
    isAutoReply.value =
      result.isAutoReply === 'true' || result.isAutoReply === true
        ? true
        : result.isAutoReply === 'false' || result.isAutoReply === false
        ? false
        : true;
    autoReplySuccessMessage.value =
      result.autoReplySuccessMessage ||
      '你好，{求职者}，我想了解一下你的基本情况和工作经历,可以发一下你的简历吗?';
    autoReplyFailMessage.value =
      result.autoReplyFailMessage ||
      '你好，{求职者}，感谢你的关注,但与本岗位要求不太匹配,祝你求职顺利!';
    academyCheckbox.value =
      result.academyCheckbox === 'true' || result.academyCheckbox === true
        ? true
        : result.academyCheckbox === 'false' || result.academyCheckbox === false
        ? false
        : true;
  } catch (e) {
    console.error(e);
  }
  const { uuid } = await browser.storage.local.get('uuid');
  token.value = result.token;
  clientId.value = result.clientId;
  if (result.token) {
    hasLogin.value = true;
  }
  // 利用 getInfo 判断 token 有没有过期
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  try {
    const responseText = await fetch(
      'https://interview-api.itasaas.com/system/user/getInfo',
      requestOptions
    );
    const response = await responseText.json();
    console.log(response, 'response');
    console.log(myHeaders, 'myHeaders');
    if (response.code !== 200) {
      // 已过期
      hasLogin.value = false;
    }
  } catch (error) {
    console.log('error', error);
  }
  if (uuid) {
    fetch(`https://ws.itasaas.com/automa/storage?id=${uuid}`)
      .then((response) => response.json())
      .then(async (data) => {
        if (data?.data?.value) {
          const options = [];
          for (const element of data.data.value.positionList) {
            options.push({
              label: element.name,
              value: element.name,
              jobDescription: '',
            });
          }
          positionOptions.value = options;
          positionAllOptions.value = data.data.value.positionList;
          // if (
          //   data.data.value.professionList &&
          //   data.data.value.professionList.length > 0
          // ) {
          //   const options2 = [];
          //   for (
          //     let element = 0;
          //     element < data.data.value.professionList.length;
          //     element++
          //   ) {
          //     options2.push({
          //       label: data.data.value.professionList[element],
          //       value: element + 1,
          //     });
          //   }
          //   options2.unshift({
          //     label: '不限',
          //     value: 0,
          //   });
          //   professionOptions.value = options2;
          // } else {
          //   professionOptions.value = [];
          // }

          // if (
          //   data.data.value.keywordList &&
          //   data.data.value.keywordList.length > 0
          // ) {
          //   const options3 = [];
          //   for (
          //     let element = 0;
          //     element < data.data.value.keywordList.length;
          //     element++
          //   ) {
          //     options3.push({
          //       label: data.data.value.keywordList[element],
          //       value: element + 1,
          //     });
          //   }
          //   keyWordsOptions.value = options3;
          // } else {
          //   keyWordsOptions.value = [];
          // }
          browser.storage.local.set({ positionOptions: positionOptions.value });
          browser.storage.local.set({
            positionAllOptions: positionAllOptions.value,
          });
          // browser.storage.local.set({
          //   professionOptions: professionOptions.value,
          // });
          // browser.storage.local.set({
          //   keyWordsOptions: keyWordsOptions.value,
          // });
          await getPointBalance();
          await getPositionRequirementList();
          browser.storage.local.remove('uuid');
        } else {
          await getPointBalance();
          await getPositionRequirementList();
        }
      });
  } else {
    await getPointBalance();
    await getPositionRequirementList();
  }
});

const p_num = computed(() => {
  const arr = [
    isAnalysis.value,
    isPreciseMatch.value,
    isExperienceMatching.value,
  ];
  return arr.filter((item) => item).length || 0;
});

// 添加这个格式化函数到script部分
const formatDifyPrompt = (includeCurrentContent = false, jobDetail) => {
  // 格式化经验要求
  const experienceValueJoin = [];
  experienceValue.value.forEach((item) => {
    experienceOptions.forEach((item2) => {
      if (item2.value === item && item !== 0) {
        experienceValueJoin.push(item2.label);
      }
    });
  });
  const experienceValueJoinStr =
    experienceValueJoin.length > 0 ? experienceValueJoin.join('，') : '不限';

  // 格式化学历要求
  const educationalValueJoin = [];
  educationalValue.value.forEach((item) => {
    educationalOptions.forEach((item2) => {
      if (item2.value === item && item !== 0) {
        educationalValueJoin.push(item2.label);
      }
    });
  });
  const educationalValueJoinStr =
    educationalValueJoin.length > 0 ? educationalValueJoin.join('，') : '不限';

  // 组合提示内容
  let promptText = `
职位描述：
${jobDetail || ''}

经验要求：
${experienceValueJoinStr}

学历要求：
${educationalValueJoinStr}
  `.trim();

  // 如果需要，添加文本框当前内容
  if (includeCurrentContent && resumeEvaluationCriteria.value) {
    promptText += `\n\n当前内容：\n${resumeEvaluationCriteria.value}`;
  }

  return promptText;
};

const safeParseJSON = (input) => {
  return input
    .replace('```json', '')
    .replace('```JSON', '')
    .replace('```', '')
    .trim();
};

/**
 * 简历评估
 * @param {*} query
 */
const aiResumeEvaluationCriteria = async (query) => {
  if (positionValue.value) {
    isError.value = false;
    let textData = null;
    if (query) {
      textData = query;
    } else {
      const JD_obj = positionOptions.value.find(
        (item) => item.label === positionValue.value
      );
      textData = JD_obj?.jobDescription || '';
    }
    isLoading.value = true;
    const userInfo = await browser.storage.local.get('userInfo');
    const prompt = formatDifyPrompt(true, textData);
    const request = {
      inputs: null,
      response_mode: 'blocking',
      user: userInfo.userInfo.userId,
      query: prompt,
    };
    const data = JSON.stringify(request);
    const requestOptions = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer app-9fWQh5gNdDAyosdng8vT6ZbW',
        'Content-Type': 'application/json',
      },
      body: data,
    };
    try {
      const response = await fetch(
        'https://ai-api.itasaas.com/v1/chat-messages',
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let res_data = null;
      res_data = await response.json();
      console.log(res_data, 'data');
      const arr = JSON.parse(safeParseJSON(res_data.answer));
      if (Array.isArray(arr)) {
        // 使用中文分号连接而不是换行符
        resumeEvaluationCriteria.value = arr.join('；') || '';
      } else {
        // 使用中文分号连接而不是换行符
        resumeEvaluationCriteria.value = arr?.answer?.join('；') || '';
      }
      isLoading.value = false;
    } catch (error) {
      console.log(error, 'error');
      isLoading.value = false;
    }
  } else {
    isError.value = true;
  }
};

const academyValue = ref([0]);

const experienceValue = ref([1]);
const educationalValue = ref([5]);

const clickHandler = (obj) => {
  if (obj.value === 1) {
    activeType.value = 'managementBackend';
  } else if (obj.value === 2) {
    logout();
  }
};

const backHome = () => {
  activeType.value = 'autoResume';
};

const positionChange = async () => {
  await browser.storage.local.set({ positionValue: positionValue.value });
  const JD_obj = positionOptions.value.find(
    (item) => item.label === positionValue.value
  );
  if (JD_obj?.jobDescription) {
    const filterConditionsObj = JSON.parse(JD_obj?.filterConditions || null);
    if (filterConditionsObj) {
      recommendChecked.value = filterConditionsObj.recommendChecked;
      browser.storage.local.set({ recommendChecked: recommendChecked.value });
      recommendNum.value = filterConditionsObj.recommendNum;
      browser.storage.local.set({ recommendNum: recommendNum.value });
      newTypeChecked.value = filterConditionsObj.newTypeChecked;
      browser.storage.local.set({ newTypeChecked: newTypeChecked.value });
      newTypeNum.value = filterConditionsObj.newTypeNum;
      browser.storage.local.set({ newTypeNum: newTypeNum.value });
      greetNum.value = filterConditionsObj.greetNum;
      browser.storage.local.set({ greetNum: greetNum.value });
      vitalityValue.value = filterConditionsObj.vitalityValue;
      browser.storage.local.set({ vitalityValue: vitalityValue.value });
      sexValue.value = filterConditionsObj.sexValue;
      browser.storage.local.set({ sexValue: sexValue.value });
      latelyChatValue.value = filterConditionsObj.latelyChatValue;
      browser.storage.local.set({ latelyChatValue: latelyChatValue.value });
      interchangeValue.value = filterConditionsObj.interchangeValue;
      browser.storage.local.set({ interchangeValue: interchangeValue.value });
      academyValue.value = filterConditionsObj.academyValue;
      browser.storage.local.set({ academyValue: academyValue.value });
      jobHoppingValue.value = filterConditionsObj.jobHoppingValue;
      browser.storage.local.set({ jobHoppingValue: jobHoppingValue.value });
      experienceValue.value = filterConditionsObj.experienceValue;
      browser.storage.local.set({ experienceValue: experienceValue.value });
      educationalValue.value = filterConditionsObj.educationalValue;
      browser.storage.local.set({ educationalValue: educationalValue.value });
      salaryValue.value = filterConditionsObj.salaryValue;
      browser.storage.local.set({ salaryValue: salaryValue.value });
      jobIntentionValue.value = filterConditionsObj.jobIntentionValue;
      browser.storage.local.set({ jobIntentionValue: jobIntentionValue.value });
      isGreetingMessage.value = filterConditionsObj.isGreetingMessage;
      browser.storage.local.set({ isGreetingMessage: isGreetingMessage.value });
      greetingMessage.value = filterConditionsObj.greetingMessage;
      browser.storage.local.set({ greetingMessage: greetingMessage.value });
      responseEvaluationCriteria.value =
        filterConditionsObj.responseEvaluationCriteria;
      ageValue.value = [
        filterConditionsObj.ageMinValue,
        filterConditionsObj.ageMaxValue,
      ];
      const c_tagList = filterConditionsObj.tagList;
      if (c_tagList.length > 0) {
        tagList.value = c_tagList;
      } else {
        tagList.value = [];
      }
      browser.storage.local.set({
        ageMinValue: filterConditionsObj.ageMinValue,
      });
      browser.storage.local.set({
        ageMaxValue: filterConditionsObj.ageMaxValue,
      });
      if (filterConditionsObj.resumeEvaluationCriteria) {
        resumeEvaluationCriteria.value =
          filterConditionsObj.resumeEvaluationCriteria;
        browser.storage.local.set({
          resumeEvaluationCriteria: resumeEvaluationCriteria.value,
        });
      } else {
        await aiResumeEvaluationCriteria(JD_obj?.jobDescription || '');
      }
    } else {
      await aiResumeEvaluationCriteria(JD_obj?.jobDescription || '');
    }
  }
  const mitData = positionAllOptions.value.find(
    (item) => item.name === positionValue.value
  );
  if (mitData) {
    if (
      Object.values(mitData.professionList) &&
      Object.values(mitData.professionList).length > 0
    ) {
      const options2 = [];
      for (
        let element = 0;
        element < Object.values(mitData.professionList).length;
        element++
      ) {
        options2.push({
          label: Object.values(mitData.professionList)[element],
          value: element + 1,
        });
      }
      options2.unshift({
        label: '不限',
        value: 0,
      });
      professionOptions.value = options2;
    } else {
      professionOptions.value = [];
    }
    professionValue.value = [1];
    if (
      Object.values(mitData.keywordList) &&
      Object.values(mitData.keywordList).length > 0
    ) {
      const options3 = [];
      for (
        let element = 0;
        element < Object.values(mitData.keywordList).length;
        element++
      ) {
        options3.push({
          label: Object.values(mitData.keywordList)[element],
          value: element + 1,
        });
      }
      keyWordsOptions.value = options3;
    } else {
      keyWordsOptions.value = [];
    }
    keyWordsValue.value = [];
    browser.storage.local.set({
      professionOptions: professionOptions.value,
    });
    browser.storage.local.set({
      keyWordsOptions: keyWordsOptions.value,
    });
  }
};
const experienceOptions = [
  { label: '不限', value: 0 },
  { label: '在校/应届', value: 1 },
  { label: `${getFormattedYear(lastYear)}年毕业`, value: 2 },
  { label: `${getFormattedYear(currentYear)}年毕业`, value: 3 },
  { label: `${getFormattedYear(currentYear)}年后毕业`, value: 4 },
  { label: '1年以内', value: 5 },
  { label: '1-3年', value: 6 },
  { label: '3-5年', value: 7 },
  { label: '5-10年', value: 8 },
  { label: '10年以上', value: 9 },
];

const experienceChange = async (value, event) => {
  for (let i = 0; i < experienceValue.value.length; i += 1) {
    // 如果选择的是不限，则取消其它的选择
    if (experienceValue.value[i] === 0) {
      if (event.value !== 0) {
        experienceValue.value.splice(i, 1);
      } else {
        experienceValue.value = [0];
      }
      break;
    }
    // 如果选择的是应届，则取消其它的选择
    if (experienceValue.value[i] === 1) {
      if (event.value !== 1) {
        experienceValue.value.splice(i, 1);
      } else {
        experienceValue.value = [1];
      }
      break;
    }
    const hasFreshGraduate = experienceValue.value.some((v) =>
      [2, 3, 4].includes(v)
    );
    // 如果选择的有经验类，则取消应届生类
    if (hasFreshGraduate && [5, 6, 7, 8, 9].includes(event.value)) {
      experienceValue.value = [event.value];
    }
    const hasExperienced = experienceValue.value.some((v) =>
      [5, 6, 7, 8, 9].includes(v)
    );
    // 如果选择的应届生类，则取消有经验类
    if (hasExperienced && [2, 3, 4].includes(event.value)) {
      experienceValue.value = [event.value];
    }
  }
  await browser.storage.local.set({ experienceValue: experienceValue.value });
  await aiResumeEvaluationCriteria(null);
};

const educationalOptions = [
  { label: '不限', value: 0 },
  { label: '初中及以下', value: 1 },
  { label: '中专/中技', value: 2 },
  { label: '高中', value: 3 },
  { label: '大专', value: 4 },
  { label: '本科', value: 5 },
  { label: '硕士', value: 6 },
  { label: '博士', value: 7 },
];

const educationalChange = async (value, event) => {
  for (let i = 0; i < educationalValue.value.length; i += 1) {
    if (educationalValue.value[i] === 0) {
      if (event.value !== 0) {
        educationalValue.value.splice(i, 1);
      } else {
        educationalValue.value = [0];
      }
      break;
    }
  }
  await browser.storage.local.set({ educationalValue: educationalValue.value });
  await aiResumeEvaluationCriteria(null);
};

const academyOptions = [
  { label: '不限', value: 0 },
  { label: '985', value: 1 },
  { label: '211', value: 2 },
  { label: '双一流院校', value: 3 },
  { label: '留学', value: 4 },
  { label: '国内外名校', value: 5 },
  { label: '公办本科', value: 6 },
];

const academyChange = async (value, event) => {
  for (let i = 0; i < academyValue.value.length; i += 1) {
    if (academyValue.value[i] === 0) {
      academyCheckbox.value = false;
      if (event.value !== 0) {
        academyValue.value.splice(i, 1);
      } else {
        academyValue.value = [0];
      }
      break;
    }
  }
  await browser.storage.local.set({
    academyValue: academyValue.value,
  });
  // await aiResumeEvaluationCriteria(null);
};

const startSynchronization = async () => {
  for (const element of workflows.value) {
    if (element.name === '同步JD列表') {
      const uuid = uuidv4();
      await browser.storage.local.set({
        uuid,
      });
      element.globalData = `{"uuid": "${uuid}"}`;
      executeWorkflow(element, true);
    }
  }
};

const startUpDateBOSSListt = async () => {
  const result = await browser.storage.local.get([
    'local_jdListToBeConfirmed',
    'local_jdListConfirmed',
    'local_jdListUpdate',
    'local_mitJdList',
  ]);
  jdListToBeConfirmed.value = result.local_jdListToBeConfirmed
    ? Object.values(result.local_jdListToBeConfirmed)
    : [];
  jdListConfirmed.value = result.local_jdListConfirmed
    ? Object.values(result.local_jdListConfirmed)
    : [];
  jdListUpdate.value = result.local_jdListUpdate
    ? Object.values(result.local_jdListUpdate)
    : [];
  const mitJdList = result.local_mitJdList
    ? Object.values(result.local_mitJdList)
    : [];
  const arr = mitJdList.map((item, index) => {
    return {
      title: item.jdPostName,
      JDPost: item.indexName,
      JDValue: item.optimizationNoHtmlJD,
    };
  });
  for (const element of workflows.value) {
    if (element.name === 'JD信息同步到BOSS') {
      const uuid = uuidv4();
      await browser.storage.local.set({
        uuid,
      });
      element.globalData = {
        upDateBOSSListt: arr,
      };
      jdListUpdate.value = mitJdList;
      browser.storage.local.set({ local_jdListUpdate: jdListUpdate.value });
      jdListConfirmed.value = jdListConfirmed.value.filter(
        (i) => !mitJdList.find((item) => item.indexName === i.indexName)
      );
      browser.storage.local.set({
        local_jdListConfirmed: jdListConfirmed.value,
      });
      executeWorkflow(element, true);
    }
  }
};

const startJD = async (type) => {
  if (type === 'Synchronization') {
    await startSynchronization();
  } else if (type === 'upDateBoss') {
    await startUpDateBOSSListt();
  }
};
</script>
<style scoped>
:deep(.t-check-tag-group) {
  line-height: 36px;
}
.recording-card {
  transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.home-form-container .t-check-tag-group .t-tag {
  margin-top: 5px;
}
.disflex {
  display: flex;
}
.fl_dir_c {
  flex-direction: column;
}
.posItem_r {
  position: relative;
}
.test_body {
  display: flex;
  align-items: center;
}
.t_mr5 {
  margin-right: 5px;
}
.t_ml5 {
  margin-left: 5px;
}
.red {
  color: #f53f3f;
}
.f14 {
  font-size: 14px;
}
.f12 {
  font-size: 12px;
}
.pos_a_err {
  position: absolute;
  bottom: -22px;
  left: 0;
}
.bg_login {
  background-image: url('../../assets//images/bg_plug_in.png');
  background-size: 100% 100%;
  z-index: -1;
}
.home_container {
  background-color: #fff;
  /* padding: 12px; */
}
.logo_container :deep(.t-image__wrapper) {
  background: #fff;
}
.top_container {
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f5;
}
.avatar_body {
  background-color: #fff;
  border-radius: 70px;
  padding-right: 8px;
}
.avatar_body:hover {
  background-color: #f2f3f5;
}
.radio_container
  :deep(
    .t-radio-group.t-radio-group--filled
      .t-radio-button.t-is-checked
      .t-radio-button__label
  ) {
  color: #165dff !important;
}
.radio_container :deep(.t-radio-group.t-radio-group--filled) {
  border-color: #f7f8fa;
  background-color: #f7f8fa;
}
.plug_container {
  margin: 14px 8px 8px !important;
  padding: 24px 0;
  border-radius: 8px;
  border: 1px solid #f2f3f5;
}
.Group_container:deep(.t-image__wrapper) {
  background: #fff;
}
:deep(.t-form__item) {
  margin-bottom: 4px;
}
.pi_close {
  position: absolute;
  left: -32px;
}
:deep(.t-collapse) {
  border: none;
}
:deep(.t-collapse-panel__header) {
  border: none !important;
}
:deep(
    .t-radio-group.t-radio-group--primary-filled .t-radio-button.t-is-checked
  ) {
  color: #ffffff !important;
}
:deep(.t-form__label--top) {
  display: flex;
}
.b_card {
  background-color: #f7f8fa;
  border-radius: 4px;
  padding: 12px;
}
:deep(.t-radio-group.t-radio-group--filled) {
  background-color: #eee;
}
</style>
